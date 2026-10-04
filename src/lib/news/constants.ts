/**
 * src/lib/news/constants.ts
 * Client-safe constants and interfaces for Phase 10: AI News (Sri Lanka Tourism).
 */

export type NewsCategory =
  | 'All'
  | 'Events'
  | 'Festivals'
  | 'Attractions'
  | 'Advisories'
  | 'Transport'
  | 'Weather'
  | 'Openings';

export interface NewsCategoryMeta {
  key: NewsCategory;
  label: string;
  label_si: string;
  colorClass: string;
  badgeClass: string;
}

export const NEWS_CATEGORIES: NewsCategoryMeta[] = [
  { key: 'All', label: 'All Updates', label_si: 'සියලු තොරතුරු', colorClass: 'bg-sky-500', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'Events', label: 'Cultural Events', label_si: 'සංස්කෘතික උත්සව', colorClass: 'bg-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'Festivals', label: 'Traditional Festivals', label_si: 'සාම්ප්‍රදායික මංගල්‍යයන්', colorClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'Attractions', label: 'New Attractions', label_si: 'නව ආකර්ෂණීය ස්ථාන', colorClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'Advisories', label: 'Travel Advisories', label_si: 'සංචාරක උපදෙස්', colorClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'Transport', label: 'Trains & Transport', label_si: 'දුම්රිය සහ ප්‍රවාහනය', colorClass: 'bg-cyan-500', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { key: 'Weather', label: 'Seasons & Climate', label_si: 'කාලගුණය සහ සෘතු', colorClass: 'bg-teal-500', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200' },
  { key: 'Openings', label: 'Parks & Openings', label_si: 'උද්‍යාන සහ විවෘත කිරීම්', colorClass: 'bg-violet-500', badgeClass: 'bg-violet-50 text-violet-800 border-violet-200' },
];

export interface RelatedPlaceSummary {
  id: number;
  name: string;
  location: string;
  image_url: string;
  rating: number;
  category?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  category: string;
  source_name: string;
  source_url: string;
  image_url: string;
  related_place_ids: number[] | string;
  related_places?: RelatedPlaceSummary[];
  status: 'published' | 'review' | 'hidden' | 'pinned';
  is_pinned: number | boolean;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewsRun {
  id: number;
  trigger_type: 'scheduled' | 'manual';
  items_found: number;
  items_added: number;
  status: 'success' | 'failed' | 'running';
  error_message?: string;
  executed_at: string;
}

export interface NewsSettings {
  enabled: boolean;
  autoPublish: boolean;
  schedule: string;
  lastRun: string | null;
}

export const DEFAULT_NEWS_SETTINGS: NewsSettings = {
  enabled: true,
  autoPublish: true,
  schedule: '06:00, 13:00, 20:00',
  lastRun: null,
};
