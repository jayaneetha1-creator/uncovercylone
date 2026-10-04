/**
 * src/lib/trips/constants.ts
 * Client-safe data models, interfaces, and helpers for Trip Planner.
 */

export interface TripPlace {
  id: number;
  name: string;
  name_si?: string;
  category?: string;
  province?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  admission_fee?: string;
}

export interface TripItem {
  id: number;
  trip_id: number;
  place_id?: number | null;
  item_type: 'place' | 'custom';
  title: string;
  notes?: string;
  order_index: number;
  is_visited: boolean;
  target_date?: string;
  created_at?: string;
  place?: TripPlace | null;
}

export interface Trip {
  id: number;
  user_id?: number | null;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_public: boolean;
  share_slug?: string;
  is_ai_planned: boolean;
  created_at?: string;
  updated_at?: string;
  items?: TripItem[];
  item_count?: number;
  visited_count?: number;
}

export interface TripCoOccurrenceSuggestion {
  place: TripPlace;
  coOccurrenceScore: number;
  reason: string;
}

export interface TripStats {
  totalTrips: number;
  totalPlannedStops: number;
  topPlaces: { id: number; name: string; count: number }[];
  avgPlacesPerTrip: number;
}
