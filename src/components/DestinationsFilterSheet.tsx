'use client';

import React from 'react';
import { X, RotateCcw, Check, Star, Filter } from 'lucide-react';
import { FilterState } from './FilterSidebar';

interface DestinationsFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
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

export default function DestinationsFilterSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categoryCounts,
  totalCount,
}: DestinationsFilterSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Content Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden animate-slide-up sm:animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#DCE8F2]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#38A9F0]" />
            <h3 className="text-base font-black text-[#0F2A3D]">
              Filter Destinations
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-9 h-9 rounded-full bg-[#F5FAFF] hover:bg-[#EAF4FD] text-[#5B7385] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Category Selection Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider block">
              Experience Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = filters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, category: cat })}
                    className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#38A9F0] text-white shadow-xs'
                        : 'bg-[#F5FAFF] text-[#5B7385] border border-[#DCE8F2] hover:text-[#0F2A3D]'
                    }`}
                  >
                    <span>{cat}</span>
                    {cat !== 'All' && categoryCounts[cat] !== undefined && (
                      <span className={`ml-1.5 text-[11px] opacity-80`}>
                        ({categoryCounts[cat] || 0})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Province Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider block">
              Province / Region
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROVINCES.map((prov) => {
                const active = filters.province === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, province: prov })}
                    className={`min-h-[44px] text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate ${
                      active
                        ? 'bg-[#EAF4FD] text-[#38A9F0] border border-[#38A9F0] font-bold'
                        : 'bg-[#F5FAFF] text-[#5B7385] border border-[#DCE8F2]'
                    }`}
                  >
                    {prov.replace(' Province', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider block">
              Minimum Rating
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Any Rating', val: 0 },
                { label: '4.5 ★ & higher', val: 4.5 },
                { label: '4.0 ★ & higher', val: 4.0 },
                { label: '3.5 ★ & higher', val: 3.5 },
              ].map((r) => {
                const active = filters.minRating === r.val;
                return (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, minRating: r.val })}
                    className={`min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      active
                        ? 'bg-[#FFF9E6] text-[#0F2A3D] border border-[#FFE8A3] font-bold'
                        : 'bg-[#F5FAFF] text-[#5B7385] border border-[#DCE8F2]'
                    }`}
                  >
                    <span>{r.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#F5A623]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entry Fee */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider block">
              Entry Fee
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'free', label: 'Free Only' },
                { id: 'paid', label: 'Paid' },
              ].map((fee) => {
                const active = filters.entryFee === fee.id;
                return (
                  <button
                    key={fee.id}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, entryFee: fee.id })}
                    className={`min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#38A9F0] text-white shadow-xs'
                        : 'bg-[#F5FAFF] text-[#5B7385] border border-[#DCE8F2]'
                    }`}
                  >
                    {fee.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Fixed Action Bar */}
        <div className="p-4 bg-white border-t border-[#DCE8F2] flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onFilterChange({
                category: 'All',
                province: 'All Provinces',
                season: 'all',
                entryFee: 'all',
                minRating: 0,
                highlight: 'all',
              });
            }}
            className="min-h-[48px] px-4 rounded-xl border border-[#DCE8F2] text-xs font-bold text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#F5FAFF] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-sm font-bold shadow-md shadow-[#38A9F0]/25 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          >
            Apply ({totalCount} results)
          </button>
        </div>

      </div>
    </div>
  );
}
