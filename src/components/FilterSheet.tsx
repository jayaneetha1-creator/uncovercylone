'use client';

import { useEffect } from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, MapPin, Tag } from 'lucide-react';
import { CategoryType } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export interface FilterSheetState {
  category: CategoryType;
  province: string;
  sortBy: 'rating' | 'distance' | 'reviews';
  freeOnly: boolean;
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSheetState;
  onApply: (filters: FilterSheetState) => void;
  onReset: () => void;
  resultCount: number;
  hasUserLocation: boolean;
}

const CATEGORIES: CategoryType[] = [
  'All',
  'Beaches',
  'Waterfalls',
  'Mountains',
  'Ancient Sites',
  'Wildlife',
  'Hidden Gems',
  'Historical',
  'Religious Places',
];

const PROVINCES = [
  'All Provinces',
  'Central Province',
  'Southern Province',
  'Western Province',
  'Uva Province',
  'Sabaragamuwa Province',
  'Northern Province',
  'Eastern Province',
  'North Central Province',
  'North Western Province',
];

export default function FilterSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  resultCount,
  hasUserLocation,
}: FilterSheetProps) {
  const { t } = useLanguage();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F2A3D]/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-[#DCE8F2]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE8F2] bg-[#F5FAFF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAF4FD] flex items-center justify-center text-[#38A9F0]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="filter-sheet-title" className="text-base font-bold text-[#0F2A3D]">
                Filter Destinations
              </h2>
              <p className="text-xs text-[#5B7385]">Refine your Sri Lanka journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="w-8 h-8 rounded-full hover:bg-white text-[#5B7385] hover:text-[#0F2A3D] flex items-center justify-center transition-colors border border-transparent hover:border-[#DCE8F2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Category */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B7385] mb-2.5">
              <Tag className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Interest / Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = filters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onApply({ ...filters, category: cat })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#38A9F0] text-white shadow-sm font-semibold'
                        : 'bg-[#F5FAFF] text-[#5B7385] border border-[#DCE8F2] hover:border-[#38A9F0] hover:text-[#38A9F0]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B7385] mb-2.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Sort Order</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rating', label: 'Top Rated' },
                { id: 'reviews', label: 'Most Reviewed' },
                { id: 'distance', label: hasUserLocation ? 'Nearest (GPS)' : 'Nearest First' },
              ].map((s) => {
                const isSelected = filters.sortBy === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onApply({ ...filters, sortBy: s.id as FilterSheetState['sortBy'] })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center border transition-all ${
                      isSelected
                        ? 'bg-[#DCEFFD] text-[#0F2A3D] border-[#38A9F0] font-bold shadow-2xs'
                        : 'bg-[#F5FAFF] text-[#5B7385] border-[#DCE8F2] hover:bg-white'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Province */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B7385] mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Province / Region</span>
            </label>
            <select
              value={filters.province}
              onChange={(e) => onApply({ ...filters, province: e.target.value })}
              className="w-full rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] py-2.5 px-3 text-xs sm:text-sm font-medium text-[#0F2A3D] focus:border-[#38A9F0] focus:ring-2 focus:ring-[#38A9F0]/20 focus:outline-none"
            >
              {PROVINCES.map((p) => (
                <option key={p} value={p === 'All Provinces' ? '' : p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Free Entry Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2]">
            <div>
              <span className="text-xs font-bold text-[#0F2A3D] block">Free Entry Only</span>
              <span className="text-[11px] text-[#5B7385]">Show places with no admission tickets</span>
            </div>
            <button
              type="button"
              onClick={() => onApply({ ...filters, freeOnly: !filters.freeOnly })}
              role="switch"
              aria-checked={filters.freeOnly}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                filters.freeOnly ? 'bg-[#38A9F0]' : 'bg-[#DCE8F2]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  filters.freeOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#DCE8F2] bg-[#F5FAFF] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B7385] hover:text-[#0F2A3D] px-3 py-2 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#38A9F0]/25 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Apply ({resultCount} places)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
