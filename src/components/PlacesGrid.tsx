'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Sparkles, Navigation, ChevronDown, Check } from 'lucide-react';
import { Place, CategoryType } from '@/types';
import PlaceCard from './PlaceCard';
import CategoryFilter from './CategoryFilter';
import FilterSheet, { FilterSheetState } from './FilterSheet';
import { useLocation, calculateDistanceKm } from '@/context/LocationContext';

interface PlacesGridProps {
  initialPlaces: Place[];
}

const PAGE_SIZE = 12;

export default function PlacesGrid({ initialPlaces }: PlacesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'reviews'>('rating');
  const [freeOnly, setFreeOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const { userCoords, status: locationStatus, requestLocation } = useLocation();

  // Category counts based on unfiltered places
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialPlaces.length };
    initialPlaces.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [initialPlaces]);

  // Sync category and search query from URL parameters and custom events
  useEffect(() => {
    const handleFilterCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string; search?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.category) {
          setSelectedCategory(customEvent.detail.category as CategoryType);
        }
        if (customEvent.detail.search !== undefined) {
          setSearchQuery(customEvent.detail.search);
        }
        setVisibleCount(PAGE_SIZE);
      }
    };

    const parseUrlParams = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const search = params.get('search');
      const prov = params.get('province');
      const sort = params.get('sort');
      const free = params.get('free');

      if (cat) setSelectedCategory(cat as CategoryType);
      if (search) setSearchQuery(search);
      if (prov) setSelectedProvince(prov);
      if (sort && (sort === 'rating' || sort === 'distance' || sort === 'reviews')) {
        setSortBy(sort);
      }
      if (free === 'true') setFreeOnly(true);
    };

    parseUrlParams();
    window.addEventListener('popstate', parseUrlParams);
    window.addEventListener('uc:filter-category', handleFilterCategory);

    return () => {
      window.removeEventListener('popstate', parseUrlParams);
      window.removeEventListener('uc:filter-category', handleFilterCategory);
    };
  }, []);

  // Update URL params smoothly when filters change
  const updateUrl = useCallback(
    (newCat: CategoryType, newSearch: string, newProv: string, newSort: string, newFree: boolean) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams();
      if (newCat && newCat !== 'All') params.set('category', newCat);
      if (newSearch) params.set('search', newSearch);
      if (newProv) params.set('province', newProv);
      if (newSort && newSort !== 'rating') params.set('sort', newSort);
      if (newFree) params.set('free', 'true');

      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}#explore` : `${window.location.pathname}#explore`;
      window.history.replaceState(null, '', newUrl);
    },
    []
  );

  const handleCategoryChange = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
    updateUrl(cat, searchQuery, selectedProvince, sortBy, freeOnly);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(PAGE_SIZE);
    updateUrl(selectedCategory, query, selectedProvince, sortBy, freeOnly);
  };

  const handleSortChange = (newSort: 'rating' | 'distance' | 'reviews') => {
    setSortBy(newSort);
    updateUrl(selectedCategory, searchQuery, selectedProvince, newSort, freeOnly);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProvince('');
    setSortBy('rating');
    setFreeOnly(false);
    setVisibleCount(PAGE_SIZE);
    updateUrl('All', '', '', 'rating', false);
  };

  // Filter & sort logic
  const filteredPlaces = useMemo(() => {
    let results = [...initialPlaces];

    if (selectedCategory !== 'All') {
      results = results.filter((p) => p.category === selectedCategory);
    }

    if (selectedProvince.trim()) {
      results = results.filter((p) => p.province.toLowerCase().includes(selectedProvince.toLowerCase()));
    }

    if (freeOnly) {
      results = results.filter((p) => {
        const fee = (p.entry_fee || '').toLowerCase();
        return fee.includes('free') || fee.includes('none') || fee === '0';
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.province.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        if (userCoords) {
          results.sort((a, b) => {
            const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
            const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
            return distA - distB;
          });
        } else {
          results.sort((a, b) => a.distance_km - b.distance_km);
        }
        break;
      case 'reviews':
        results.sort((a, b) => b.review_count - a.review_count);
        break;
    }

    return results;
  }, [initialPlaces, selectedCategory, selectedProvince, freeOnly, searchQuery, sortBy, userCoords]);

  const displayedPlaces = filteredPlaces.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPlaces.length;

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedProvince ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (sortBy !== 'rating' ? 1 : 0);

  const filterSheetState: FilterSheetState = {
    category: selectedCategory,
    province: selectedProvince,
    sortBy,
    freeOnly,
  };

  const handleApplyFromSheet = (newFilters: FilterSheetState) => {
    setSelectedCategory(newFilters.category);
    setSelectedProvince(newFilters.province);
    setSortBy(newFilters.sortBy);
    setFreeOnly(newFilters.freeOnly);
    setVisibleCount(PAGE_SIZE);
    updateUrl(newFilters.category, searchQuery, newFilters.province, newFilters.sortBy, newFilters.freeOnly);
  };

  return (
    <section id="explore" className="w-full bg-[#F5FAFF] py-12 sm:py-16 lg:py-20 border-t border-[#DCE8F2]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider mb-2.5 border border-[#DCEFFD]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Island Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2A3D] tracking-tight">
            Explore All <span className="text-[#38A9F0]">Destinations</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5B7385] leading-relaxed">
            {initialPlaces.length} hand-verified landmarks, serene beaches, misty tea trails, and ancient ruins across Sri Lanka.
          </p>
        </div>

        {/* ━━━ STICKY FILTER BAR ━━━ */}
        <div className="sticky top-16 z-20 bg-[#F5FAFF]/95 backdrop-blur-md pt-2 pb-4 border-b border-[#DCE8F2]/60 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            
            {/* Top row: Search input + Controls */}
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B7385]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, province, or keywords..."
                  className="w-full rounded-xl border border-[#DCE8F2] bg-white py-2.5 sm:py-3 pl-10 pr-9 text-xs sm:text-sm text-[#0F2A3D] placeholder:text-[#5B7385]/60 transition-all focus:border-[#38A9F0] focus:ring-2 focus:ring-[#38A9F0]/15 focus:outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B7385] hover:text-[#0F2A3D] p-1 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="hidden sm:block relative shrink-0">
                <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5B7385] pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                  aria-label="Sort destinations"
                  className="appearance-none rounded-xl border border-[#DCE8F2] bg-white py-2.5 sm:py-3 pl-9 pr-9 text-xs sm:text-sm font-medium text-[#0F2A3D] transition-all focus:border-[#38A9F0] focus:ring-2 focus:ring-[#38A9F0]/15 focus:outline-none cursor-pointer shadow-2xs hover:border-[#38A9F0]/40"
                >
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="distance">{userCoords ? 'Nearest (Live GPS)' : 'Nearest First'}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5B7385] pointer-events-none" />
              </div>

              {/* Mobile Filter Button (opens bottom sheet) */}
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="sm:hidden shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE8F2] text-[#0F2A3D] text-xs font-semibold shadow-2xs active:scale-95 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#38A9F0]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#38A9F0] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* GPS Distance Trigger Pill */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {userCoords ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#EAF4FD] text-[#0F2A3D] border border-[#DCE8F2]">
                    <span className="w-2 h-2 rounded-full bg-[#2FB67C] animate-pulse" />
                    <span>Live GPS Active · Distances from your position</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const coords = await requestLocation();
                      if (coords) handleSortChange('distance');
                    }}
                    disabled={locationStatus === 'requesting'}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white text-[#5B7385] hover:text-[#38A9F0] border border-[#DCE8F2] hover:border-[#38A9F0] transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Navigation className="w-3 h-3 text-[#38A9F0]" />
                    <span>{locationStatus === 'requesting' ? 'Locating...' : 'Near me (GPS)'}</span>
                  </button>
                )}

                {/* Free Only filter pill for desktop */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !freeOnly;
                    setFreeOnly(next);
                    updateUrl(selectedCategory, searchQuery, selectedProvince, sortBy, next);
                  }}
                  className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    freeOnly
                      ? 'bg-[#38A9F0] text-white border-[#38A9F0] font-semibold'
                      : 'bg-white text-[#5B7385] border-[#DCE8F2] hover:border-[#38A9F0]'
                  }`}
                >
                  {freeOnly && <Check className="w-3 h-3 text-white" />}
                  <span>Free Entry</span>
                </button>
              </div>

              {/* Result Count Indicator */}
              <div className="text-[11px] sm:text-xs font-medium text-[#5B7385]">
                Showing <strong className="text-[#0F2A3D]">{filteredPlaces.length}</strong> of {initialPlaces.length} destinations
              </div>
            </div>

            {/* Category horizontal scroll pills */}
            <div className="pt-1">
              <CategoryFilter
                selected={selectedCategory}
                onChange={handleCategoryChange}
                counts={categoryCounts}
              />
            </div>
          </div>
        </div>

        {/* ━━━ PLACES GRID (1/2/3/4-COL RESPONSIVE) ━━━ */}
        {filteredPlaces.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
              {displayedPlaces.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} />
              ))}
            </div>

            {/* Progressive Reveal / Load More */}
            {hasMore && (
              <div className="flex flex-col items-center justify-center pt-6 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredPlaces.length))}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#EAF4FD] text-[#0F2A3D] hover:text-[#38A9F0] font-bold text-xs sm:text-sm border border-[#DCE8F2] hover:border-[#38A9F0] transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Load More Destinations</span>
                  <span className="text-xs text-[#5B7385] font-normal">
                    ({filteredPlaces.length - displayedPlaces.length} remaining)
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-[#DCE8F2] bg-white p-10 text-center shadow-xs">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF4FD] text-[#38A9F0]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base sm:text-lg font-bold text-[#0F2A3D]">No destinations match your filters</h3>
            <p className="mb-5 text-xs sm:text-sm text-[#5B7385] max-w-xs">
              Try adjusting your search keywords, clearing selected category tags, or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#38A9F0] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E93DC] transition-colors shadow-sm cursor-pointer"
            >
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filterSheetState}
        onApply={handleApplyFromSheet}
        onReset={handleResetFilters}
        resultCount={filteredPlaces.length}
        hasUserLocation={!!userCoords}
      />
    </section>
  );
}
