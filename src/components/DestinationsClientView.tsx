'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Place } from '@/types';
import DestinationRow from './DestinationRow';
import FilterSidebar, { FilterState } from './FilterSidebar';
import DestinationsFilterSheet from './DestinationsFilterSheet';
import AdPlacement from './AdPlacement';
import { useLocation } from '@/context/LocationContext';
import { trackSearchQuery } from '@/lib/analytics';
import {
  Map, Filter, ChevronLeft, ChevronRight, RotateCcw,
  Sparkles, Compass, Star, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

interface DestinationsClientViewProps {
  initialPlaces: Place[];
  reviewSnippetsMap: Record<number, string[]>;
}

const ITEMS_PER_PAGE = 12;

function DestinationsInnerView({ initialPlaces, reviewSnippetsMap }: DestinationsClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userCoords, getDistanceTo, requestLocation } = useLocation();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || 'All',
    province: searchParams.get('province') || 'All Provinces',
    season: searchParams.get('season') || 'all',
    entryFee: searchParams.get('entryFee') || 'all',
    minRating: parseFloat(searchParams.get('rating') || '0') || 0,
    highlight: searchParams.get('highlight') || 'all',
    search: searchParams.get('q') || '',
  });

  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'nearest' | 'newest'>(
    (searchParams.get('sort') as any) || 'rating'
  );

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '1', 10) || 1
  );

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state to URL without full page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.province !== 'All Provinces') params.set('province', filters.province);
    if (filters.season !== 'all') params.set('season', filters.season);
    if (filters.entryFee !== 'all') params.set('entryFee', filters.entryFee);
    if (filters.minRating > 0) params.set('rating', String(filters.minRating));
    if (filters.highlight !== 'all') params.set('highlight', filters.highlight);
    if (sortBy !== 'rating') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));

    const queryStr = params.toString();
    const newUrl = queryStr ? `/destinations?${queryStr}` : '/destinations';
    window.history.replaceState(null, '', newUrl);
  }, [filters, sortBy, currentPage]);

  // Compute category & province counts across all places
  const { categoryCounts, provinceCounts } = useMemo(() => {
    const cats: Record<string, number> = {};
    const provs: Record<string, number> = {};

    for (const p of initialPlaces) {
      if (p.category) {
        cats[p.category] = (cats[p.category] || 0) + 1;
      }
      if (p.province) {
        provs[p.province] = (provs[p.province] || 0) + 1;
      }
    }
    return { categoryCounts: cats, provinceCounts: provs };
  }, [initialPlaces]);

  // Filter places
  const filteredPlaces = useMemo(() => {
    return initialPlaces.filter((p) => {
      // Category filter
      if (filters.category !== 'All' && p.category !== filters.category) {
        return false;
      }

      // Province filter
      if (filters.province !== 'All Provinces' && p.province !== filters.province) {
        return false;
      }

      // Min rating
      if (filters.minRating > 0 && (p.rating || 0) < filters.minRating) {
        return false;
      }

      // Entry fee
      if (filters.entryFee === 'free') {
        const fee = (p.entry_fee || '').toLowerCase();
        if (!fee.includes('free') && fee.length > 0) return false;
      } else if (filters.entryFee === 'paid') {
        const fee = (p.entry_fee || '').toLowerCase();
        if (fee.includes('free') || fee.length === 0) return false;
      }

      // Season filter
      if (filters.season === 'nov-apr') {
        const bt = (p.best_time || '').toLowerCase();
        const matches = ['nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'year-round', 'all year'];
        if (!matches.some((m) => bt.includes(m))) return false;
      } else if (filters.season === 'may-sep') {
        const bt = (p.best_time || '').toLowerCase();
        const matches = ['may', 'jun', 'jul', 'aug', 'sep', 'year-round', 'all year'];
        if (!matches.some((m) => bt.includes(m))) return false;
      } else if (filters.season === 'year-round') {
        const bt = (p.best_time || '').toLowerCase();
        if (!bt.includes('year') && !bt.includes('all')) return false;
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchDesc = (p.short_description || p.description || '').toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc) return false;
      }

      return true;
    });
  }, [initialPlaces, filters]);

  // Track search queries for analytics with debounce
  useEffect(() => {
    const q = (filters.search || '').trim();
    if (!q || q.length < 2) return;
    const timer = setTimeout(() => {
      trackSearchQuery(q, filteredPlaces.length);
    }, 800);
    return () => clearTimeout(timer);
  }, [filters.search, filteredPlaces.length]);

  // Sort places
  const sortedPlaces = useMemo(() => {
    const list = [...filteredPlaces];
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating || (b.review_count || 0) - (a.review_count || 0));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.review_count || 0) - (a.review_count || 0) || b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'nearest') {
      if (userCoords) {
        list.sort((a, b) => {
          const distA = getDistanceTo(a.lat, a.lng) ?? 9999;
          const distB = getDistanceTo(b.lat, b.lng) ?? 9999;
          return distA - distB;
        });
      }
    }
    return list;
  }, [filteredPlaces, sortBy, userCoords, getDistanceTo]);

  // Pagination calculations
  const totalCount = sortedPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedPlaces = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return sortedPlaces.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPlaces, validPage]);

  // Dynamic Page Title
  const pageTitle = useMemo(() => {
    if (filters.category !== 'All') {
      return `${filters.category} in Sri Lanka`;
    }
    if (filters.province !== 'All Provinces') {
      return `Destinations in ${filters.province.replace(' Province', '')}`;
    }
    return 'Destinations in Sri Lanka';
  }, [filters.category, filters.province]);

  const activeFiltersCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.province !== 'All Provinces' ? 1 : 0) +
    (filters.season !== 'all' ? 1 : 0) +
    (filters.entryFee !== 'all' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#0F2A3D] pb-24">
      
      {/* ━━━ BREADCRUMB & HEADER ━━━ */}
      <div className="bg-white border-b border-[#DCE8F2]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#5B7385] mb-3">
            <Link href="/" className="hover:text-[#38A9F0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0F2A3D]">Destinations</span>
            {filters.category !== 'All' && (
              <>
                <span>/</span>
                <span className="text-[#38A9F0] font-bold">{filters.category}</span>
              </>
            )}
          </nav>

          {/* Heading Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2A3D] tracking-tight">
                {pageTitle}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5B7385] max-w-xl">
                Explore handpicked locations, verified reviews, entry fees, and optimal visiting seasons across the island.
              </p>
            </div>

            {/* Map Link */}
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF4FD] hover:bg-[#DCEFFD] text-[#38A9F0] text-xs sm:text-sm font-bold border border-[#DCEFFD] transition-colors self-start md:self-auto cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>Interactive Map View</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ━━━ MAIN CONTAINER (STICKY FILTER SIDEBAR + RANKED LIST) ━━━ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sub-header / Sort / Results Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#DCE8F2]">
          
          <div className="flex items-center gap-2 text-xs text-[#5B7385] font-semibold">
            <span>
              Showing {totalCount === 0 ? 0 : (validPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(validPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} destinations
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5B7385] font-bold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSortBy(val);
                  if (val === 'nearest' && !userCoords) {
                    requestLocation();
                  }
                }}
                className="bg-white border border-[#DCE8F2] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A3D] focus:outline-none focus:border-[#38A9F0] cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular (Reviews)</option>
                <option value="nearest">Nearest to Me</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE8F2] text-xs font-bold text-[#0F2A3D] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
          </div>

        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* ━━━ LEFT COLUMN: STICKY FILTER SIDEBAR (DESKTOP) ━━━ */}
          <div className="hidden lg:block sticky top-24">
            <FilterSidebar
              filters={filters}
              onFilterChange={(newF) => {
                setFilters(newF);
                setCurrentPage(1);
              }}
              categoryCounts={categoryCounts}
              provinceCounts={provinceCounts}
              totalCount={totalCount}
            />
          </div>

          {/* ━━━ RIGHT COLUMN: RANKED DESTINATION ROWS ━━━ */}
          <main className="space-y-5">
            
            {/* Active Filter Pills Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap pb-2">
                <span className="text-xs font-bold text-[#5B7385]">Applied:</span>
                {filters.category !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold border border-[#DCEFFD]">
                    <span>Category: {filters.category}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, category: 'All' })}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.province !== 'All Provinces' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold border border-[#DCEFFD]">
                    <span>{filters.province.replace(' Province', '')}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, province: 'All Provinces' })}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF9E6] text-[#0F2A3D] text-xs font-bold border border-[#FFE8A3]">
                    <span>{filters.minRating}★+</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, minRating: 0 })}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.entryFee !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold border border-[#DCEFFD]">
                    <span>Fee: {filters.entryFee}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, entryFee: 'all' })}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      category: 'All',
                      province: 'All Provinces',
                      season: 'all',
                      entryFee: 'all',
                      minRating: 0,
                      highlight: 'all',
                    });
                    setCurrentPage(1);
                  }}
                  className="text-xs text-[#E5484D] hover:underline font-bold ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Destination Rows List */}
            {paginatedPlaces.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#DCE8F2] p-12 text-center space-y-4">
                <Compass className="w-12 h-12 text-[#5B7385] mx-auto opacity-30" />
                <h3 className="text-lg font-black text-[#0F2A3D]">
                  No destinations match your filters
                </h3>
                <p className="text-xs sm:text-sm text-[#5B7385] max-w-md mx-auto">
                  Try widening your filter selections, choosing another province, or clearing filters to view all stops.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      category: 'All',
                      province: 'All Provinces',
                      season: 'all',
                      entryFee: 'all',
                      minRating: 0,
                      highlight: 'all',
                    });
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9F0] text-white text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              paginatedPlaces.map((place, index) => {
                const globalRank = (validPage - 1) * ITEMS_PER_PAGE + index + 1;
                const snippets = reviewSnippetsMap[place.id] || [];
                const distanceKm = userCoords ? getDistanceTo(place.lat, place.lng) : null;

                return (
                  <React.Fragment key={place.id}>
                    <DestinationRow
                      place={place}
                      rank={globalRank}
                      reviewSnippets={snippets}
                      distanceKm={distanceKm}
                    />

                    {/* Sponsored Place Card (Placement 1) */}
                    {index === 1 && (
                      <AdPlacement placement="grid_card" />
                    )}

                    {/* Section 4.6-B: Interspersed curated strip after row 4 */}
                    {index === 3 && (
                      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] border border-[#DCE8F2] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white text-[#38A9F0] flex items-center justify-center shadow-xs flex-shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#0F2A3D]">
                              Looking for off-the-beaten-path tranquillity?
                            </h4>
                            <p className="text-xs text-[#5B7385]">
                              Discover our handpicked collection of secluded waterfalls and secret coastal coves.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFilters({ ...filters, category: 'Hidden Gems' });
                            setCurrentPage(1);
                          }}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5FAFF] border border-[#DCE8F2] text-xs font-bold text-[#38A9F0] shadow-xs cursor-pointer flex-shrink-0"
                        >
                          Show Hidden Gems
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}

            {/* ━━━ NUMBERED PAGINATION (SECTION 4.6-B: "Numbered pagination 12–30 per page") ━━━ */}
            {totalPages > 1 && (
              <div className="pt-8 pb-4 flex items-center justify-center gap-2">
                
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={validPage === 1}
                  aria-label="Previous page"
                  className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl border border-[#DCE8F2] bg-white hover:bg-[#F5FAFF] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-[#0F2A3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === validPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className={`min-h-[44px] min-w-[44px] rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#38A9F0] text-white shadow-md shadow-[#38A9F0]/25'
                          : 'bg-white border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#F5FAFF]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={validPage === totalPages}
                  aria-label="Next page"
                  className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl border border-[#DCE8F2] bg-white hover:bg-[#F5FAFF] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-[#0F2A3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>

              </div>
            )}

          </main>

        </div>

      </div>

      {/* ━━━ MOBILE BOTTOM STICKY BAR (<768px / 390px) ━━━ */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 min-h-[48px] bg-[#0F2A3D] text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Filter className="w-4 h-4 text-[#38A9F0]" />
          <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
        </button>

        <Link
          href="/map"
          className="min-h-[48px] px-5 bg-white text-[#0F2A3D] border border-[#DCE8F2] rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Map className="w-4 h-4 text-[#38A9F0]" />
          <span>Map</span>
        </Link>
      </div>

      {/* ━━━ MOBILE FILTER BOTTOM SHEET ━━━ */}
      <DestinationsFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={(newF) => {
          setFilters(newF);
          setCurrentPage(1);
        }}
        categoryCounts={categoryCounts}
        totalCount={totalCount}
      />

    </div>
  );
}

export default function DestinationsClientView(props: DestinationsClientViewProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5FAFF] p-8 text-center text-xs text-[#5B7385]">Loading destinations...</div>}>
      <DestinationsInnerView {...props} />
    </Suspense>
  );
}
