/**
 * src/lib/db/trips.ts
 * Server-side data access layer for Trips and Trip Items.
 * Handles database CRUD, ordering, guest migration, co-occurrence analytics, and slug generation.
 */

import { query, execute } from '../db';
import { Trip, TripItem, TripPlace, TripCoOccurrenceSuggestion, TripStats } from '../trips/constants';
import crypto from 'crypto';

interface DbTripRow {
  id: number;
  user_id: number | null;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_public: number;
  share_slug: string | null;
  is_ai_planned: number;
  created_at: string;
  updated_at: string;
}

interface DbTripItemRow {
  id: number;
  trip_id: number;
  place_id: number | null;
  item_type: string;
  title: string;
  notes: string;
  order_index: number;
  is_visited: number;
  target_date: string;
  created_at: string;
  // Place joined fields
  p_id?: number | null;
  p_name?: string | null;
  p_name_si?: string | null;
  p_category?: string | null;
  p_province?: string | null;
  p_image_url?: string | null;
  p_latitude?: number | null;
  p_longitude?: number | null;
  p_rating?: number | null;
  p_admission_fee?: string | null;
}

function mapTripRow(row: DbTripRow): Trip {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    is_public: Boolean(row.is_public),
    share_slug: row.share_slug || undefined,
    is_ai_planned: Boolean(row.is_ai_planned),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapTripItemRow(row: DbTripItemRow): TripItem {
  let place: TripPlace | null = null;
  if (row.place_id && row.p_name) {
    place = {
      id: row.place_id,
      name: row.p_name,
      name_si: row.p_name_si || undefined,
      category: row.p_category || undefined,
      province: row.p_province || undefined,
      image_url: row.p_image_url || undefined,
      latitude: Number(row.p_latitude) || 0,
      longitude: Number(row.p_longitude) || 0,
      rating: Number(row.p_rating) || 0,
      admission_fee: row.p_admission_fee || undefined,
    };
  }

  return {
    id: row.id,
    trip_id: row.trip_id,
    place_id: row.place_id,
    item_type: (row.item_type as 'place' | 'custom') || 'place',
    title: row.title,
    notes: row.notes || '',
    order_index: row.order_index,
    is_visited: Boolean(row.is_visited),
    target_date: row.target_date || '',
    created_at: row.created_at,
    place,
  };
}

/**
 * Fetch all trips for a given authenticated user with item counts
 */
export async function getUserTrips(userId: number): Promise<Trip[]> {
  const sql = `
    SELECT 
      t.*,
      COUNT(ti.id) AS item_count,
      SUM(CASE WHEN ti.is_visited = 1 THEN 1 ELSE 0 END) AS visited_count
    FROM trips t
    LEFT JOIN trip_items ti ON t.id = ti.trip_id
    WHERE t.user_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;
  const rows = await query<any>(sql, [userId]);
  return rows.map((r) => ({
    ...mapTripRow(r),
    item_count: Number(r.item_count) || 0,
    visited_count: Number(r.visited_count) || 0,
  }));
}

/**
 * Fetch a specific trip with all its items populated with place metadata
 */
export async function getTripById(tripId: number, userId?: number): Promise<Trip | null> {
  const tripRows = await query<DbTripRow>(
    `SELECT * FROM trips WHERE id = ?`,
    [tripId]
  );
  if (!tripRows || tripRows.length === 0) return null;

  const trip = mapTripRow(tripRows[0]);
  if (userId !== undefined && trip.user_id !== null && trip.user_id !== userId && !trip.is_public) {
    return null; // Unauthorized to view private trip of another user
  }

  const itemsSql = `
    SELECT 
      ti.*,
      l.id AS p_id,
      l.name AS p_name,
      l.name_si AS p_name_si,
      l.category AS p_category,
      l.province AS p_province,
      l.image_url AS p_image_url,
      l.latitude AS p_latitude,
      l.longitude AS p_longitude,
      l.rating AS p_rating,
      l.admission_fee AS p_admission_fee
    FROM trip_items ti
    LEFT JOIN locations l ON ti.place_id = l.id
    WHERE ti.trip_id = ?
    ORDER BY ti.order_index ASC, ti.id ASC
  `;
  const itemRows = await query<DbTripItemRow>(itemsSql, [tripId]);
  trip.items = itemRows.map(mapTripItemRow);
  trip.item_count = trip.items.length;
  trip.visited_count = trip.items.filter((i) => i.is_visited).length;

  return trip;
}

/**
 * Fetch a public trip by its shareable slug
 */
export async function getTripByShareSlug(slug: string): Promise<Trip | null> {
  const tripRows = await query<DbTripRow>(
    `SELECT * FROM trips WHERE share_slug = ? AND is_public = 1`,
    [slug]
  );
  if (!tripRows || tripRows.length === 0) return null;

  return getTripById(tripRows[0].id);
}

/**
 * Create a new trip for a user
 */
export async function createTrip(
  userId: number | null,
  data: {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    is_public?: boolean;
    is_ai_planned?: boolean;
  }
): Promise<Trip> {
  const shareSlug = crypto.randomBytes(6).toString('hex');
  const result = await execute(
    `INSERT INTO trips (user_id, title, description, start_date, end_date, is_public, share_slug, is_ai_planned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.title.trim() || 'My Sri Lanka Trip',
      data.description?.trim() || '',
      data.start_date || '',
      data.end_date || '',
      data.is_public ? 1 : 0,
      shareSlug,
      data.is_ai_planned ? 1 : 0,
    ]
  );

  const newId = result.insertId;
  const created = await getTripById(newId);
  if (!created) throw new Error('Failed to create trip');
  return created;
}

/**
 * Update an existing trip (verifying ownership)
 */
export async function updateTrip(
  tripId: number,
  userId: number,
  data: Partial<Trip>
): Promise<Trip | null> {
  const existing = await getTripById(tripId);
  if (!existing || existing.user_id !== userId) return null;

  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title.trim());
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description.trim());
  }
  if (data.start_date !== undefined) {
    updates.push('start_date = ?');
    params.push(data.start_date);
  }
  if (data.end_date !== undefined) {
    updates.push('end_date = ?');
    params.push(data.end_date);
  }
  if (data.is_public !== undefined) {
    updates.push('is_public = ?');
    params.push(data.is_public ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(tripId);
    await execute(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  return getTripById(tripId);
}

/**
 * Delete a trip (cascades to items)
 */
export async function deleteTrip(tripId: number, userId: number): Promise<boolean> {
  const existing = await getTripById(tripId);
  if (!existing || existing.user_id !== userId) return false;

  await execute(`DELETE FROM trips WHERE id = ?`, [tripId]);
  return true;
}

/**
 * Add a stop or custom task to a trip
 */
export async function addTripItem(
  tripId: number,
  data: {
    place_id?: number | null;
    item_type?: 'place' | 'custom';
    title: string;
    notes?: string;
    target_date?: string;
  }
): Promise<TripItem> {
  // Determine next order_index
  const maxRows = await query<{ max_order: number | null }>(
    `SELECT MAX(order_index) AS max_order FROM trip_items WHERE trip_id = ?`,
    [tripId]
  );
  const nextOrder = (maxRows[0]?.max_order ?? -1) + 1;

  // Auto-fill title from place if place_id provided and title is empty
  let itemTitle = data.title;
  if (data.place_id && (!itemTitle || !itemTitle.trim())) {
    const pRows = await query<{ name: string }>(`SELECT name FROM locations WHERE id = ?`, [data.place_id]);
    if (pRows && pRows[0]) itemTitle = pRows[0].name;
  }

  const result = await execute(
    `INSERT INTO trip_items (trip_id, place_id, item_type, title, notes, order_index, is_visited, target_date)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      tripId,
      data.place_id || null,
      data.item_type || 'place',
      itemTitle.trim() || 'Trip Stop',
      data.notes?.trim() || '',
      nextOrder,
      data.target_date || '',
    ]
  );

  const inserted = await query<DbTripItemRow>(
    `SELECT ti.*, l.name AS p_name, l.name_si AS p_name_si, l.category AS p_category, l.province AS p_province,
            l.image_url AS p_image_url, l.latitude AS p_latitude, l.longitude AS p_longitude, l.rating AS p_rating, l.admission_fee AS p_admission_fee
     FROM trip_items ti
     LEFT JOIN locations l ON ti.place_id = l.id
     WHERE ti.id = ?`,
    [result.insertId]
  );

  return mapTripItemRow(inserted[0]);
}

/**
 * Update an item (notes, visited status, date, title)
 */
export async function updateTripItem(
  itemId: number,
  data: Partial<TripItem>
): Promise<TripItem | null> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title.trim());
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes.trim());
  }
  if (data.is_visited !== undefined) {
    updates.push('is_visited = ?');
    params.push(data.is_visited ? 1 : 0);
  }
  if (data.target_date !== undefined) {
    updates.push('target_date = ?');
    params.push(data.target_date);
  }
  if (data.order_index !== undefined) {
    updates.push('order_index = ?');
    params.push(data.order_index);
  }

  if (updates.length > 0) {
    params.push(itemId);
    await execute(`UPDATE trip_items SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const rows = await query<DbTripItemRow>(
    `SELECT ti.*, l.name AS p_name, l.name_si AS p_name_si, l.category AS p_category, l.province AS p_province,
            l.image_url AS p_image_url, l.latitude AS p_latitude, l.longitude AS p_longitude, l.rating AS p_rating, l.admission_fee AS p_admission_fee
     FROM trip_items ti
     LEFT JOIN locations l ON ti.place_id = l.id
     WHERE ti.id = ?`,
    [itemId]
  );
  if (!rows || rows.length === 0) return null;
  return mapTripItemRow(rows[0]);
}

/**
 * Delete a specific trip item
 */
export async function deleteTripItem(itemId: number): Promise<boolean> {
  await execute(`DELETE FROM trip_items WHERE id = ?`, [itemId]);
  return true;
}

/**
 * Reorder trip items by an array of item IDs in desired order
 */
export async function reorderTripItems(tripId: number, itemIdsInOrder: number[]): Promise<boolean> {
  for (let i = 0; i < itemIdsInOrder.length; i++) {
    await execute(
      `UPDATE trip_items SET order_index = ? WHERE id = ? AND trip_id = ?`,
      [i, itemIdsInOrder[i], tripId]
    );
  }
  return true;
}

/**
 * Sync guest local storage trips to a freshly authenticated user account
 */
export async function syncGuestTrips(userId: number, guestTrips: any[]): Promise<number> {
  if (!Array.isArray(guestTrips) || guestTrips.length === 0) return 0;
  let synced = 0;

  for (const gTrip of guestTrips) {
    if (!gTrip || !gTrip.title) continue;
    const newTrip = await createTrip(userId, {
      title: gTrip.title,
      description: gTrip.description,
      start_date: gTrip.start_date,
      end_date: gTrip.end_date,
      is_ai_planned: Boolean(gTrip.is_ai_planned),
    });

    if (Array.isArray(gTrip.items)) {
      for (const item of gTrip.items) {
        await addTripItem(newTrip.id, {
          place_id: item.place_id || item.place?.id || null,
          item_type: item.item_type || 'place',
          title: item.title || item.place?.name || 'Stop',
          notes: item.notes || '',
          target_date: item.target_date || '',
        });
      }
    }
    synced++;
  }

  return synced;
}

/**
 * Co-occurrence recommendations based on places that frequently appear together in other user trips
 */
export async function getTripCoOccurrenceSuggestions(
  currentPlaceIds: number[]
): Promise<TripCoOccurrenceSuggestion[]> {
  if (!currentPlaceIds || currentPlaceIds.length === 0) {
    // If no places in trip yet, return top popular destinations
    const popularSql = `
      SELECT id, name, name_si, category, province, image_url, latitude, longitude, rating, admission_fee
      FROM locations
      WHERE status = 'approved' AND image_url IS NOT NULL AND image_url != ''
      ORDER BY rating DESC, click_count DESC
      LIMIT 4
    `;
    const rows = await query<any>(popularSql);
    return rows.map((r) => ({
      place: {
        id: r.id,
        name: r.name,
        name_si: r.name_si,
        category: r.category,
        province: r.province,
        image_url: r.image_url,
        latitude: Number(r.latitude) || 0,
        longitude: Number(r.longitude) || 0,
        rating: Number(r.rating) || 0,
        admission_fee: r.admission_fee,
      },
      coOccurrenceScore: 0.9,
      reason: 'Top Sri Lanka travel highlight',
    }));
  }

  const placeholders = currentPlaceIds.map(() => '?').join(',');

  // Find other places that appear in trips that contain any of currentPlaceIds
  const coSql = `
    SELECT 
      ti2.place_id,
      COUNT(DISTINCT ti2.trip_id) AS co_count,
      l.name, l.name_si, l.category, l.province, l.image_url, l.latitude, l.longitude, l.rating, l.admission_fee
    FROM trip_items ti1
    JOIN trip_items ti2 ON ti1.trip_id = ti2.trip_id
    JOIN locations l ON ti2.place_id = l.id
    WHERE ti1.place_id IN (${placeholders})
      AND ti2.place_id NOT IN (${placeholders})
      AND ti2.place_id IS NOT NULL
      AND l.status = 'approved'
    GROUP BY ti2.place_id
    ORDER BY co_count DESC, l.rating DESC
    LIMIT 4
  `;

  try {
    const rows = await query<any>(coSql, [...currentPlaceIds, ...currentPlaceIds]);
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        place: {
          id: r.place_id,
          name: r.name,
          name_si: r.name_si,
          category: r.category,
          province: r.province,
          image_url: r.image_url,
          latitude: Number(r.latitude) || 0,
          longitude: Number(r.longitude) || 0,
          rating: Number(r.rating) || 0,
          admission_fee: r.admission_fee,
        },
        coOccurrenceScore: Number(r.co_count),
        reason: 'Travelers who visited your destinations also added this',
      }));
    }
  } catch (err) {
    console.error('Co-occurrence query error:', err);
  }

  // Fallback: nearby destinations based on average center of current trip
  const coordsSql = `SELECT latitude, longitude FROM locations WHERE id IN (${placeholders})`;
  const locs = await query<{ latitude: number; longitude: number }>(coordsSql, currentPlaceIds);
  if (locs.length > 0) {
    const avgLat = locs.reduce((sum, l) => sum + (Number(l.latitude) || 0), 0) / locs.length;
    const avgLng = locs.reduce((sum, l) => sum + (Number(l.longitude) || 0), 0) / locs.length;

    const nearbySql = `
      SELECT id, name, name_si, category, province, image_url, latitude, longitude, rating, admission_fee
      FROM locations
      WHERE status = 'approved' AND id NOT IN (${placeholders})
      ORDER BY ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) ASC
      LIMIT 4
    `;
    const nearbyRows = await query<any>(nearbySql, [...currentPlaceIds, avgLat, avgLat, avgLng, avgLng]);
    return nearbyRows.map((r) => ({
      place: {
        id: r.id,
        name: r.name,
        name_si: r.name_si,
        category: r.category,
        province: r.province,
        image_url: r.image_url,
        latitude: Number(r.latitude) || 0,
        longitude: Number(r.longitude) || 0,
        rating: Number(r.rating) || 0,
        admission_fee: r.admission_fee,
      },
      coOccurrenceScore: 0.8,
      reason: 'Convenient stop along your planned travel area',
    }));
  }

  return [];
}

/**
 * Aggregate trip statistics for the admin analytics panel
 */
export async function getAggregateTripStats(): Promise<TripStats> {
  const countRows = await query<{ total_trips: number; total_items: number }>(`
    SELECT 
      (SELECT COUNT(*) FROM trips) AS total_trips,
      (SELECT COUNT(*) FROM trip_items) AS total_items
  `);

  const topPlacesRows = await query<{ id: number; name: string; count: number }>(`
    SELECT l.id, l.name, COUNT(ti.id) AS count
    FROM trip_items ti
    JOIN locations l ON ti.place_id = l.id
    WHERE ti.place_id IS NOT NULL
    GROUP BY ti.place_id
    ORDER BY count DESC
    LIMIT 5
  `);

  const totalTrips = Number(countRows[0]?.total_trips) || 0;
  const totalItems = Number(countRows[0]?.total_items) || 0;
  const avg = totalTrips > 0 ? Math.round((totalItems / totalTrips) * 10) / 10 : 0;

  return {
    totalTrips,
    totalPlannedStops: totalItems,
    topPlaces: topPlacesRows.map((r) => ({
      id: r.id,
      name: r.name,
      count: Number(r.count),
    })),
    avgPlacesPerTrip: avg,
  };
}
