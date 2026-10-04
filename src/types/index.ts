export interface Place {
  id: number;
  name: string;
  description: string;
  short_description: string;
  location: string;
  province: string;
  category: string;
  lat: number;
  lng: number;
  image_url: string;
  gallery: string; // JSON string array
  tips: string;
  best_time: string;
  entry_fee: string;
  distance_km: number;
  rating: number;
  review_count: number;
  featured: number;
  status?: 'published' | 'draft' | 'pending' | 'archived';
  created_at: string;
}

export interface Review {
  id: number;
  place_id: number;
  place_name?: string;
  author: string;
  rating: number;
  comment: string;
  status?: 'approved' | 'pending' | 'spam';
  photos?: string[];
  ratings?: { clean?: number; crowd?: number; value?: number; accessibility?: number };
  helpful_count?: number;
  created_at: string;
}

export type CategoryType =
  | 'All'
  | 'Beaches'
  | 'Waterfalls'
  | 'Mountains'
  | 'Ancient Sites'
  | 'Wildlife'
  | 'Hidden Gems'
  | 'Historical'
  | 'Religious Places';

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  actor: string;
  created_at: string;
}

export type UserRole = 'owner' | 'developer' | 'uploader' | 'user';
export type UserStatus = 'unverified' | 'active' | 'suspended';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  country: string;
  avatar: string;
  status: UserStatus;
  password_hash?: string;
  email_verified_at: string | null;
  must_change_password?: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SiteNode {
  id: number;
  parent_id: number | null;
  node_key: string;
  type: 'page' | 'section' | 'block' | 'item';
  title_en: string;
  title_si: string;
  enabled: number;
  sort_order: number;
  default_open: number;
  priority: number;
  device_visibility: 'all' | 'desktop_only' | 'mobile_only';
  config?: string | Record<string, unknown> | null;
  created_at?: string;
  children?: SiteNode[];
}

export interface HeroSlide {
  id: number;
  image_url: string;
  location: string;
  province: string;
  title_en?: string;
  title_si?: string;
  subtitle_en?: string;
  subtitle_si?: string;
  sort_order: number;
  enabled?: number;
  created_at?: string;
}

export interface RegionSlide {
  id: number;
  image_url: string;
  title: string;
  title_si?: string;
  region: string;
  sort_order: number;
  enabled?: number;
  created_at?: string;
}

export interface Ad {
  id: number;
  placement: 'grid_card' | 'home_banner' | 'sidebar_partner' | 'carousel_slot' | 'footer_strip';
  title_en: string;
  title_si?: string;
  description?: string;
  image_url: string;
  target_url: string;
  start_date?: string | null;
  end_date?: string | null;
  device_target: 'all' | 'mobile' | 'desktop';
  enabled: number;
  impressions: number;
  clicks: number;
  created_at: string;
}

export interface Trip {
  id: number;
  user_id: number | null;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_ai_planned: number;
  is_public: number;
  share_token?: string | null;
  created_at: string;
  items?: TripItem[];
}

export interface TripItem {
  id: number;
  trip_id: number;
  place_id: number | null;
  custom_title: string;
  notes: string;
  sort_order: number;
  is_visited: number;
  place?: Place | null;
  created_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  image_url: string;
  category: string;
  related_place_id?: number | null;
  is_pinned: number;
  is_hidden: number;
  published_at: string;
  created_at: string;
}

export interface ChangeRequest {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  action_type: 'delete' | 'edit' | 'publish';
  entity_type: string;
  entity_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: number | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number | null;
  recipient_role?: string | null;
  type: string;
  title: string;
  body: string;
  link: string;
  payload?: Record<string, unknown> | null;
  is_read: number;
  created_at: string;
}


