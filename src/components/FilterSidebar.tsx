'use client';

import React, { useState } from 'react';
import {
  ChevronDown, X, RotateCcw, Filter, Check,
  Sparkles, Star, MapPin, Tag, Calendar, Ticket
} from 'lucide-react';

export interface FilterState {
  category: string;
  province: string;
  season: string;
  entryFee: string;
  minRating: number;
  highlight: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  categoryCounts: Record<string, number>;
  provinceCounts: Record<string, number>;
  totalCount: number;
  className?: string;
}

const CATEGORIES = [
  'All',
  'Beaches',
  'Waterfalls',
  'Mountains',
  'Ancient Sites',
  'Wildlife',
  'Hidden Gems',
  'Historical',
  'Religious Places'
];

const PROVINCES = [
  'All Provinces',
  'Central Province',
  'Southern Province',
  'Western Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

const SEASONS = [
  { label: 'Any Season', value: 'all' },
  { label: 'Nov – Apr (South & West Coast)', value: 'nov-apr' },
  { label: 'May – Sep (East Coast & North)', value: 'may-sep' },
  { label: 'Year-Round Favourites', value: 'year-round' },
];

const RATINGS = [
  { label: 'Any Rating', value: 0 },
  { label: '4.5 ★ & higher', value: 4.5 },
  { label: '4.0 ★ & higher', value: 4.0 },
  { label: '3.5 ★ & higher', value: 3.5 },
];

export default function FilterSidebar({
  filters,
  onFilterChange,
  categoryCounts,
  provinceCounts,
  totalCount,
  className = '',
}: FilterSidebarProps) {
  // Collapsible accordion group open state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    category: true,
    province: true,
    rating: true,
    season: false,
    entryFee: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    onFilterChange({
      category: 'All',
      province: 'All Provinces',
      season: 'all',
      entryFee: 'all',
      minRating: 0,
      highlight: 'all',
    });
  };

  const isFiltered =
    filters.category !== 'All' ||
    filters.province !== 'All Provinces' ||
    filters.season !== 'all' ||
    filters.entryFee !== 'all' ||
    filters.minRating > 0 ||
    filters.highlight !== 'all';

  return (
    <aside
      className={`bg-white rounded-3xl border border-[#DCE8F2] shadow-[0_2px_16px_rgba(15,42,61,0.03)] p-5 lg:p-6 space-y-6 ${className}`}
    >
      {/* ━━━ SIDEBAR HEADER ━━━ */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DCE8F2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAF4FD] text-[#38A9F0] flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F2A3D] uppercase tracking-wider">
              Filters
            </h2>
            <p className="text-[11px] text-[#5B7385]">
              {totalCount} destinations found
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-[#38A9F0] hover:text-[#1E93DC] font-bold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ━━━ GROUP 1: CATEGORY / TYPE ━━━ */}
      <div className="space-y-3 pb-5 border-b border-[#F0F5FA]">
        <button
          type="button"
          onClick={() => toggleGroup('category')}
          className="w-full flex items-center justify-between text-xs font-black text-[#0F2A3D] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#38A9F0]" />
            Experience Type
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#5B7385] transition-transform duration-200 ${
              openGroups.category ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.category && (
          <div className="space-y-1.5 pt-1">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' ? totalCount : categoryCounts[cat] || 0;
              const active = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, category: cat })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#38A9F0] text-white shadow-xs'
                      : 'text-[#5B7385] hover:bg-[#F5FAFF] hover:text-[#0F2A3D]'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-[#EAF4FD] text-[#5B7385]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ━━━ GROUP 2: PROVINCE ━━━ */}
      <div className="space-y-3 pb-5 border-b border-[#F0F5FA]">
        <button
          type="button"
          onClick={() => toggleGroup('province')}
          className="w-full flex items-center justify-between text-xs font-black text-[#0F2A3D] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#38A9F0]" />
            Province &amp; Region
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#5B7385] transition-transform duration-200 ${
              openGroups.province ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.province && (
          <div className="space-y-1 pt-1 max-h-56 overflow-y-auto pr-1">
            {PROVINCES.map((prov) => {
              const count = prov === 'All Provinces' ? totalCount : provinceCounts[prov] || 0;
              const active = filters.province === prov;
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, province: prov })}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#EAF4FD] text-[#38A9F0] font-bold'
                      : 'text-[#5B7385] hover:bg-[#F5FAFF] hover:text-[#0F2A3D]'
                  }`}
                >
                  <span className="truncate">{prov.replace(' Province', '')}</span>
                  {active && <Check className="w-3.5 h-3.5 text-[#38A9F0] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ━━━ GROUP 3: MINIMUM RATING ━━━ */}
      <div className="space-y-3 pb-5 border-b border-[#F0F5FA]">
        <button
          type="button"
          onClick={() => toggleGroup('rating')}
          className="w-full flex items-center justify-between text-xs font-black text-[#0F2A3D] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[#F5A623]" />
            Traveler Rating
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#5B7385] transition-transform duration-200 ${
              openGroups.rating ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.rating && (
          <div className="space-y-1 pt-1">
            {RATINGS.map((r) => {
              const active = filters.minRating === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, minRating: r.value })}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FFF9E6] text-[#0F2A3D] border border-[#FFE8A3] font-bold'
                      : 'text-[#5B7385] hover:bg-[#F5FAFF] hover:text-[#0F2A3D]'
                  }`}
                >
                  <span>{r.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-[#F5A623]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ━━━ GROUP 4: ENTRY FEE (FREE / PAID) ━━━ */}
      <div className="space-y-3 pb-5 border-b border-[#F0F5FA]">
        <button
          type="button"
          onClick={() => toggleGroup('entryFee')}
          className="w-full flex items-center justify-between text-xs font-black text-[#0F2A3D] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-[#38A9F0]" />
            Entry Fee
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#5B7385] transition-transform duration-200 ${
              openGroups.entryFee ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.entryFee && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'free', label: 'Free' },
              { id: 'paid', label: 'Paid' },
            ].map((fee) => {
              const active = filters.entryFee === fee.id;
              return (
                <button
                  key={fee.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, entryFee: fee.id })}
                  className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#38A9F0] text-white shadow-xs'
                      : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] border border-[#DCE8F2]'
                  }`}
                >
                  {fee.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ━━━ GROUP 5: BEST SEASON ━━━ */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleGroup('season')}
          className="w-full flex items-center justify-between text-xs font-black text-[#0F2A3D] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#38A9F0]" />
            Best Visiting Season
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#5B7385] transition-transform duration-200 ${
              openGroups.season ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.season && (
          <div className="space-y-1 pt-1">
            {SEASONS.map((s) => {
              const active = filters.season === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, season: s.value })}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#EAF4FD] text-[#38A9F0] font-bold'
                      : 'text-[#5B7385] hover:bg-[#F5FAFF] hover:text-[#0F2A3D]'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
