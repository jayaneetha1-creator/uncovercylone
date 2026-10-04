/**
 * src/lib/recommend.ts
 * Explainable, fast multi-factor recommendation engine.
 * Combines:
 * 1. Proximity (Haversine formula on lat/lng)
 * 2. Collaborative Transitions (viewed A -> then viewed B from journey paths)
 * 3. Category / Interest Affinity
 * 4. Popularity with time decay
 * Enforces diversity rule to prevent 6 identical places.
 */

import { query, queryOne } from './db';
import { Place, RecommendedPlace } from '@/types';
import { getTransitionsForPlace } from './db/analytics';

export interface RecommendOptions {
  currentPlaceId?: number;
  userId?: number | null;
  sessionId?: string;
  limit?: number;
  excludeIds?: number[];
  userLat?: number;
  userLng?: number;
}

export interface RecommenderWeights {
  proximity: number;
  collaborative: number;
  categoryAffinity: number;
  popularity: number;
}

export const DEFAULT_WEIGHTS: RecommenderWeights = {
  proximity: 0.35,
  collaborative: 0.30,
  categoryAffinity: 0.20,
  popularity: 0.15,
};

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Multi-factor recommendation algorithm.
 */
export async function getRecommendations(options: RecommendOptions): Promise<RecommendedPlace[]> {
  const limit = options.limit || 6;
  const excludeSet = new Set<number>(options.excludeIds || []);
  if (options.currentPlaceId) {
    excludeSet.add(options.currentPlaceId);
  }

  try {
    // 1. Fetch current place if provided
    let currentPlace: Place | null = null;
    if (options.currentPlaceId) {
      currentPlace = await queryOne<Place>('SELECT * FROM places WHERE id = ?', [options.currentPlaceId]);
    }

    // 2. Fetch user's recent journey history (for category affinity)
    let historyPlaceIds: number[] = [];
    if (options.sessionId) {
      const journey = await queryOne<{ path: string }>(
        'SELECT path FROM journeys WHERE session_id = ?',
        [options.sessionId]
      );
      if (journey && journey.path) {
        try {
          historyPlaceIds = typeof journey.path === 'string' ? JSON.parse(journey.path) : journey.path;
        } catch {
          historyPlaceIds = [];
        }
      }
    }

    // 3. Collaborative transitions (who viewed current place also viewed...)
    const transitions = options.currentPlaceId
      ? await getTransitionsForPlace(options.currentPlaceId, 10)
      : [];
    const transitionScores = new Map<number, number>();
    const maxTransitionCount = transitions.length > 0 ? Math.max(...transitions.map((t) => t.count)) : 1;
    for (const t of transitions) {
      transitionScores.set(t.to_place_id, t.count / maxTransitionCount);
    }

    // 4. Fetch candidate published places
    const allPlaces = await query<Place>(
      "SELECT * FROM places WHERE status = 'published' OR status IS NULL"
    );

    if (allPlaces.length === 0) {
      return [];
    }

    // Determine user reference coordinates (either current place, or user's GPS coords)
    const refLat = currentPlace ? currentPlace.lat : options.userLat;
    const refLng = currentPlace ? currentPlace.lng : options.userLng;

    // Calculate category affinity from history
    const categoryCounts = new Map<string, number>();
    if (historyPlaceIds.length > 0) {
      for (const hid of historyPlaceIds) {
        const hp = allPlaces.find((p) => p.id === hid);
        if (hp && hp.category) {
          categoryCounts.set(hp.category, (categoryCounts.get(hp.category) || 0) + 1);
        }
      }
    } else if (currentPlace && currentPlace.category) {
      categoryCounts.set(currentPlace.category, 2);
    }

    // 5. Score candidates
    interface ScoredCandidate {
      place: Place;
      score: number;
      reason: string;
      distanceKm?: number;
    }

    const scored: ScoredCandidate[] = [];

    for (const place of allPlaces) {
      if (excludeSet.has(place.id)) continue;

      let proximityScore = 0;
      let distanceKm: number | undefined;
      if (refLat !== undefined && refLng !== undefined && place.lat && place.lng) {
        distanceKm = calculateDistanceKm(refLat, refLng, place.lat, place.lng);
        // Distance score: 1.0 at 0km, decreasing towards 0 at 120km
        proximityScore = Math.max(0, 1 - distanceKm / 120);
      }

      // Collaborative score
      const collabScore = transitionScores.get(place.id) || 0;

      // Category affinity
      const catCount = categoryCounts.get(place.category) || 0;
      const catScore = Math.min(1, catCount * 0.4);

      // Popularity (based on rating and review count)
      const popRating = (place.rating || 4.0) / 5.0;
      const popReviews = Math.min(1, (place.review_count || 0) / 100);
      const popularityScore = popRating * 0.7 + popReviews * 0.3;

      // Final weighted sum
      const totalScore =
        proximityScore * DEFAULT_WEIGHTS.proximity +
        collabScore * DEFAULT_WEIGHTS.collaborative +
        catScore * DEFAULT_WEIGHTS.categoryAffinity +
        popularityScore * DEFAULT_WEIGHTS.popularity;

      // Determine human-readable reason tag
      let reason = 'Popular traveler recommendation';
      if (collabScore > 0.4 && currentPlace) {
        reason = `Travelers who viewed ${currentPlace.name} also loved this`;
      } else if (distanceKm !== undefined && distanceKm <= 35 && currentPlace) {
        reason = `Close to ${currentPlace.name} (${distanceKm} km away)`;
      } else if (catScore > 0.5) {
        reason = `Matches your interest in ${place.category}`;
      } else if (distanceKm !== undefined && distanceKm <= 60) {
        reason = `Nearby destination (${distanceKm} km away)`;
      } else if ((place.rating || 0) >= 4.7) {
        reason = `Top rated (${place.rating} ★) in ${place.province}`;
      }

      scored.push({
        place,
        score: totalScore,
        reason,
        distanceKm,
      });
    }

    // 6. Sort by totalScore descending
    scored.sort((a, b) => b.score - a.score);

    // 7. Apply diversity rule: max 2 places of the exact same category
    const result: RecommendedPlace[] = [];
    const categoryDistribution = new Map<string, number>();

    for (const item of scored) {
      const cat = item.place.category || 'General';
      const count = categoryDistribution.get(cat) || 0;

      // Allow if under category quota, or if we haven't filled up the requested limit
      if (count < 2 || scored.length <= limit) {
        categoryDistribution.set(cat, count + 1);
        result.push({
          ...item.place,
          reason: item.reason,
          matchScore: Math.round(item.score * 100),
          distance_km: item.distanceKm ?? item.place.distance_km,
        });
      }

      if (result.length >= limit) {
        break;
      }
    }

    // If diversity filter was too strict and left open slots, backfill with remaining best scored
    if (result.length < limit) {
      for (const item of scored) {
        if (!result.some((r) => r.id === item.place.id)) {
          result.push({
            ...item.place,
            reason: item.reason,
            matchScore: Math.round(item.score * 100),
            distance_km: item.distanceKm ?? item.place.distance_km,
          });
        }
        if (result.length >= limit) break;
      }
    }

    return result;
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    // Cold start fallback: return popular places
    try {
      const fallback = await query<Place>(
        'SELECT * FROM places ORDER BY rating DESC, review_count DESC LIMIT ?',
        [limit]
      );
      return fallback.map((p) => ({
        ...p,
        reason: 'Recommended Sri Lanka highlight',
      }));
    } catch {
      return [];
    }
  }
}
