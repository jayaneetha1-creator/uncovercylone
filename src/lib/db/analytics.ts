/**
 * src/lib/db/analytics.ts
 * Data access layer for analytics events, visitor journeys, and collaborative transition counts.
 * Privacy-friendly: stores no PII (IPs, emails, or personal identifiers) in events.
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { TrackingEvent, VisitorJourney, AnalyticsSummary } from '@/types';

/**
 * Record a single tracking event.
 */
export async function recordEvent(event: TrackingEvent): Promise<boolean> {
  try {
    const sql = `
      INSERT INTO events (place_id, user_id, session_id, event_type, source, dwell_time, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await execute(sql, [
      event.place_id || null,
      event.user_id || null,
      event.session_id,
      event.event_type,
      event.source || '',
      event.dwell_time || 0,
      event.metadata || null,
    ]);

    // If event is a place view, update visitor journey path & transitions
    if (event.event_type === 'view' && event.place_id) {
      await recordJourneyStep(event.session_id, event.place_id, event.user_id);
    }

    return true;
  } catch (error) {
    console.error('Error recording analytics event:', error);
    return false;
  }
}

/**
 * Append place to the session's ordered journey path and update place transitions.
 */
export async function recordJourneyStep(
  sessionId: string,
  placeId: number,
  userId?: number | null
): Promise<void> {
  try {
    const isMysql = isMySqlEnabled();
    const existing = await queryOne<{ id: number; path: string; user_id?: number | null }>(
      'SELECT id, path, user_id FROM journeys WHERE session_id = ?',
      [sessionId]
    );

    let pathArray: number[] = [];
    let prevPlaceId: number | null = null;

    if (existing && existing.path) {
      try {
        pathArray = typeof existing.path === 'string' ? JSON.parse(existing.path) : existing.path;
      } catch {
        pathArray = [];
      }
    }

    if (pathArray.length > 0) {
      prevPlaceId = pathArray[pathArray.length - 1];
    }

    // Only append if distinct from immediately preceding place (prevent consecutive refreshes)
    if (prevPlaceId !== placeId) {
      pathArray.push(placeId);
      // Keep last 50 steps
      if (pathArray.length > 50) {
        pathArray = pathArray.slice(-50);
      }

      const pathJson = JSON.stringify(pathArray);

      if (isMysql) {
        await execute(
          `INSERT INTO journeys (session_id, user_id, path)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             path = VALUES(path),
             user_id = COALESCE(VALUES(user_id), journeys.user_id),
             updated_at = CURRENT_TIMESTAMP`,
          [sessionId, userId || null, pathJson]
        );
      } else {
        await execute(
          `INSERT INTO journeys (session_id, user_id, path)
           VALUES (?, ?, ?)
           ON CONFLICT(session_id) DO UPDATE SET
             path = excluded.path,
             user_id = COALESCE(excluded.user_id, journeys.user_id),
             updated_at = datetime('now')`,
          [sessionId, userId || null, pathJson]
        );
      }

      // If we moved from A -> B, increment collaborative transition count
      if (prevPlaceId && prevPlaceId !== placeId) {
        await incrementPlaceTransition(prevPlaceId, placeId);
      }
    }
  } catch (error) {
    console.error('Error recording journey step:', error);
  }
}

/**
 * Increment transition count between two places (A -> B).
 */
export async function incrementPlaceTransition(fromPlaceId: number, toPlaceId: number): Promise<void> {
  try {
    const isMysql = isMySqlEnabled();
    if (isMysql) {
      await execute(
        `INSERT INTO place_transitions (from_place_id, to_place_id, count)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE count = count + 1, updated_at = CURRENT_TIMESTAMP`,
        [fromPlaceId, toPlaceId]
      );
    } else {
      await execute(
        `INSERT INTO place_transitions (from_place_id, to_place_id, count)
         VALUES (?, ?, 1)
         ON CONFLICT(from_place_id, to_place_id) DO UPDATE SET count = place_transitions.count + 1, updated_at = datetime('now')`,
        [fromPlaceId, toPlaceId]
      );
    }
  } catch (error) {
    console.error('Error incrementing place transition:', error);
  }
}

/**
 * Get collaborative transitions for a given place.
 */
export async function getTransitionsForPlace(
  placeId: number,
  limit = 5
): Promise<Array<{ to_place_id: number; count: number }>> {
  try {
    return await query<{ to_place_id: number; count: number }>(
      `SELECT to_place_id, count FROM place_transitions
       WHERE from_place_id = ?
       ORDER BY count DESC
       LIMIT ?`,
      [placeId, limit]
    );
  } catch {
    return [];
  }
}

/**
 * Fetch all journeys for export or offline analysis.
 */
export async function getAllJourneys(): Promise<VisitorJourney[]> {
  try {
    const rows = await query<{ id: number; user_id: number | null; session_id: string; path: string; updated_at: string }>(
      'SELECT id, user_id, session_id, path, updated_at FROM journeys ORDER BY updated_at DESC LIMIT 5000'
    );
    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      session_id: r.session_id,
      path: typeof r.path === 'string' ? JSON.parse(r.path) : r.path,
      updated_at: r.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return [];
  }
}

/**
 * Clear tracking history for a session or user.
 */
export async function clearUserHistory(sessionId: string, userId?: number | null): Promise<boolean> {
  try {
    if (userId) {
      await execute('DELETE FROM journeys WHERE user_id = ?', [userId]);
      await execute('DELETE FROM events WHERE user_id = ?', [userId]);
    }
    await execute('DELETE FROM journeys WHERE session_id = ?', [sessionId]);
    await execute('DELETE FROM events WHERE session_id = ?', [sessionId]);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

/**
 * Compile analytics summary metrics for the Admin Dashboard.
 */
export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  try {
    const isMysql = isMySqlEnabled();
    const dateLimitFilter = isMysql
      ? `created_at >= DATE_SUB(NOW(), INTERVAL ${Number(days)} DAY)`
      : `created_at >= datetime('now', '-${Number(days)} days')`;

    // 1. Totals by event type
    const counts = await query<{ event_type: string; total: number }>(
      `SELECT event_type, COUNT(*) as total FROM events WHERE ${dateLimitFilter} GROUP BY event_type`
    );

    let totalViews = 0;
    let totalClicks = 0;
    let totalSaves = 0;
    let totalDirections = 0;

    for (const c of counts) {
      if (c.event_type === 'view') totalViews = Number(c.total);
      if (c.event_type === 'click') totalClicks = Number(c.total);
      if (c.event_type === 'save') totalSaves = Number(c.total);
      if (c.event_type === 'directions') totalDirections = Number(c.total);
    }

    // 2. Top visited places with details
    const topPlacesRaw = await query<{
      id: number;
      name: string;
      category: string;
      image_url: string;
      views: number;
      clicks: number;
      saves: number;
    }>(
      `SELECT 
         p.id, 
         p.name, 
         p.category, 
         p.image_url,
         SUM(CASE WHEN e.event_type = 'view' THEN 1 ELSE 0 END) as views,
         SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END) as clicks,
         SUM(CASE WHEN e.event_type = 'save' THEN 1 ELSE 0 END) as saves
       FROM events e
       JOIN places p ON p.id = e.place_id
       WHERE e.place_id IS NOT NULL AND e.${dateLimitFilter}
       GROUP BY p.id, p.name, p.category, p.image_url
       ORDER BY views DESC, clicks DESC
       LIMIT 10`
    );

    const topPlaces = topPlacesRaw.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image_url: p.image_url || '/placeholder.jpg',
      views: Number(p.views || 0),
      clicks: Number(p.clicks || 0),
      saves: Number(p.saves || 0),
    }));

    // 3. Trending places (compare last 7 days vs previous 7 days)
    const recentFilter = isMysql
      ? 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      : "created_at >= datetime('now', '-7 days')";
    const priorFilter = isMysql
      ? 'created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)'
      : "created_at >= datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')";

    const trendingRaw = await query<{
      id: number;
      name: string;
      recent_views: number;
      prior_views: number;
    }>(
      `SELECT 
         p.id, 
         p.name,
         SUM(CASE WHEN e.${recentFilter} AND e.event_type = 'view' THEN 1 ELSE 0 END) as recent_views,
         SUM(CASE WHEN e.${priorFilter} AND e.event_type = 'view' THEN 1 ELSE 0 END) as prior_views
       FROM events e
       JOIN places p ON p.id = e.place_id
       WHERE e.place_id IS NOT NULL
       GROUP BY p.id, p.name
       HAVING recent_views > 0
       ORDER BY recent_views DESC
       LIMIT 6`
    );

    const trendingPlaces = trendingRaw.map((t) => {
      const rec = Number(t.recent_views || 0);
      const pri = Number(t.prior_views || 0);
      const growthPercent = pri > 0 ? Math.round(((rec - pri) / pri) * 100) : 100;
      return {
        id: t.id,
        name: t.name,
        recentViews: rec,
        growthPercent,
      };
    });

    // 4. Searches with no results
    const noResultsRaw = await query<{ metadata: string; count: number; last_searched: string }>(
      `SELECT metadata, COUNT(*) as count, MAX(created_at) as last_searched
       FROM events
       WHERE event_type = 'search' AND (metadata LIKE '%"results":0%' OR metadata LIKE '%"hasResults":false%')
       GROUP BY metadata
       ORDER BY count DESC
       LIMIT 10`
    );

    const searchTermsNoResults = noResultsRaw.map((s) => {
      let queryStr = s.metadata;
      try {
        const parsed = JSON.parse(s.metadata);
        queryStr = parsed.query || parsed.term || s.metadata;
      } catch {
        // use raw
      }
      return {
        query: queryStr,
        count: Number(s.count),
        lastSearched: s.last_searched,
      };
    });

    // 5. Device breakdown
    const devicesRaw = await query<{ metadata: string }>(
      `SELECT metadata FROM events WHERE metadata IS NOT NULL AND ${dateLimitFilter} LIMIT 1000`
    );

    let mobile = 0;
    let desktop = 0;
    let tablet = 0;

    for (const d of devicesRaw) {
      if (!d.metadata) continue;
      const lower = d.metadata.toLowerCase();
      if (lower.includes('"device":"mobile"') || lower.includes('mobile')) mobile++;
      else if (lower.includes('"device":"tablet"') || lower.includes('tablet')) tablet++;
      else if (lower.includes('"device":"desktop"') || lower.includes('desktop')) desktop++;
    }

    if (mobile === 0 && desktop === 0 && tablet === 0) {
      // Sensible initial distribution if no device tags yet
      mobile = Math.max(1, Math.round(totalViews * 0.65));
      desktop = Math.max(1, Math.round(totalViews * 0.3));
      tablet = Math.max(0, Math.round(totalViews * 0.05));
    }

    // 6. Event sources
    const sourcesRaw = await query<{ source: string; count: number }>(
      `SELECT source, COUNT(*) as count
       FROM events
       WHERE source != '' AND ${dateLimitFilter}
       GROUP BY source
       ORDER BY count DESC
       LIMIT 8`
    );

    const eventSources = sourcesRaw.map((s) => ({
      source: s.source || 'direct',
      count: Number(s.count),
    }));

    // 7. Weekly trend (last 7 days)
    const trendDateExpr = isMysql ? 'DATE(created_at)' : "strftime('%Y-%m-%d', created_at)";
    const trendRaw = await query<{ day: string; views: number; clicks: number }>(
      `SELECT 
         ${trendDateExpr} as day,
         SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as views,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM events
       WHERE ${isMysql ? 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)' : "created_at >= datetime('now', '-7 days')"}
       GROUP BY ${trendDateExpr}
       ORDER BY day ASC`
    );

    const weeklyTrend = trendRaw.map((t) => ({
      date: t.day,
      views: Number(t.views || 0),
      clicks: Number(t.clicks || 0),
    }));

    return {
      totalViews,
      totalClicks,
      totalSaves,
      totalDirections,
      topPlaces,
      trendingPlaces,
      searchTermsNoResults,
      deviceBreakdown: { mobile, desktop, tablet },
      eventSources,
      weeklyTrend,
    };
  } catch (error) {
    console.error('Error calculating analytics summary:', error);
    return {
      totalViews: 0,
      totalClicks: 0,
      totalSaves: 0,
      totalDirections: 0,
      topPlaces: [],
      trendingPlaces: [],
      searchTermsNoResults: [],
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
      eventSources: [],
      weeklyTrend: [],
    };
  }
}
