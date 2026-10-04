'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from 'react';
import { Place, CategoryType } from '@/types';
import Link from 'next/link';
import { useTrips } from '@/context/TripContext';
import {
  Map, Search, SlidersHorizontal, Star, MapPin, X,
  Globe, Waves, Droplets, Mountain, PawPrint, Landmark,
  Castle, Gem, Loader2, Navigation, ChevronRight,
  Filter, Layers, RotateCcw, Compass, Check, CheckSquare, Square
} from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin text-slate-800 mb-3" />
      <span className="text-sm font-bold text-slate-600">Initializing Ceylon Explorer Map...</span>
      <span className="text-xs text-slate-400 mt-1">Plotting coordinates & terrain layers</span>
    </div>
  ),
});

const CATEGORIES: { label: CategoryType; icon: React.ElementType }[] = [
  { label: 'All', icon: Globe },
  { label: 'Beaches', icon: Waves },
  { label: 'Mountains', icon: Mountain },
  { label: 'Waterfalls', icon: Droplets },
  { label: 'Wildlife', icon: PawPrint },
  { label: 'Ancient Sites', icon: Landmark },
  { label: 'Historical', icon: Castle },
  { label: 'Religious Places', icon: Star },
  { label: 'Hidden Gems', icon: Gem },
];

const PROVINCES = [
  'All Provinces',
  'Central Province',
  'Southern Province',
  'Western Province',
  'Uva Province',
  'Sabaragamuwa Province',
  'North Central Province',
  'North Western Province',
  'Eastern Province',
  'Northern Province',
];

const RATING_FILTERS = [
  { label: 'All Ratings', value: 0 },
  { label: '4.8+ ★', value: 4.8 },
  { label: '4.5+ ★', value: 4.5 },
  { label: '4.0+ ★', value: 4.0 },
];

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [minRating, setMinRating] = useState(0);

  // Active selected place to center map & open popup
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Mobile tab state: 'map' or 'list'
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Recenter counter trigger
  const [recenterCount, setRecenterCount] = useState(0);

  // Trip Itinerary Side Panel
  const { activeTrip, toggleVisited } = useTrips();
  const [isTripPanelOpen, setIsTripPanelOpen] = useState(false);

  useEffect(() => {
    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => {
        setPlaces(data.places || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtered places calculation
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Province filter
      if (selectedProvince !== 'All Provinces' && p.province !== selectedProvince) {
        return false;
      }
      // Rating filter
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchDesc = p.short_description.toLowerCase().includes(q);
        const matchProv = p.province.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc && !matchProv) {
          return false;
        }
      }
      return true;
    });
  }, [places, selectedCategory, selectedProvince, minRating, searchQuery]);

  // Featured places subset
  const featuredInView = useMemo(() => {
    return filteredPlaces.filter((p) => p.featured === 1);
  }, [filteredPlaces]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedProvince('All Provinces');
    setMinRating(0);
    setSelectedPlace(null);
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedProvince !== 'All Provinces' ||
    minRating > 0;

  return (
    <div className="pt-16 sm:pt-20 h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      
      {/* ━━━ TOP BAR / EXPEDITION HEADER ━━━ */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex-shrink-0 z-30 shadow-xs">
        <div className="max-w-full flex items-center justify-between gap-4">
          
          {/* Title & Stats */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Ceylon Travel Explorer
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  Live GPS
                </span>
              </div>
              <p className="text-slate-500 text-xs truncate">
                Showing <strong className="text-sky-600 font-bold">{filteredPlaces.length}</strong> of {places.length} destinations
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setMobileTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mobileTab === 'list'
                    ? 'bg-white text-sky-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>List ({filteredPlaces.length})</span>
              </button>
              <button
                onClick={() => {
                  setMobileTab('map');
                  setRecenterCount((c) => c + 1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mobileTab === 'map'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>

            <Link
              href="/#explore"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-sky-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Back to Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ━━━ MAIN WORKSPACE (SPLIT LAYOUT) ━━━ */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ━━━━ LEFT SIDEBAR: MINIMALIST DIRECTORY & PLACES LIST ━━━━ */}
        <aside
          className={`w-full lg:w-[380px] xl:w-[420px] bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 z-20 h-full overflow-hidden transition-all duration-300 ${
            mobileTab === 'list' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Minimalist Filters Header Area */}
          <div className="px-4 py-3.5 border-b border-slate-100 space-y-2.5 bg-white flex-shrink-0">
            
            {/* 1. Search Bar (Clean, soft borderless pill) */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, towns, districts..."
                className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/20 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 transition-all border-0 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Compact Inline Filter Pills (Category, Province, Rating) */}
            <div className="flex items-center gap-1.5">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="flex-1 min-w-0 bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border-0 transition-colors truncate"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.label} value={cat.label}>
                    {cat.label === 'All' ? 'All Categories' : cat.label}
                  </option>
                ))}
              </select>

              {/* Province */}
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="flex-1 min-w-0 bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border-0 transition-colors truncate"
              >
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov === 'All Provinces' ? 'All Provinces' : prov.replace(' Province', '')}
                  </option>
                ))}
              </select>

              {/* Rating */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer border-0 transition-colors shrink-0"
              >
                {RATING_FILTERS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Subheader: Result Count & Featured Tag */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100/80 bg-slate-50/50 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {searchQuery || selectedCategory !== 'All' || selectedProvince !== 'All Provinces'
                ? `Results (${filteredPlaces.length})`
                : `Destinations (${filteredPlaces.length})`}
            </span>
            
            {featuredInView.length > 0 && !isFiltered && (
              <span className="text-[10px] text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-full">
                ★ {featuredInView.length} Featured
              </span>
            )}
          </div>

          {/* 5. Minimalist Destination Items List (No heavy box borders!) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-sky-600 mx-auto mb-2" />
                <span className="text-xs font-semibold">Loading destinations...</span>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="py-12 text-center p-6">
                <Search className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700 mb-1">No spots found</h4>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      if (window.innerWidth < 1024) {
                        setMobileTab('map');
                      }
                    }}
                    className={`group relative cursor-pointer p-2.5 rounded-xl transition-all duration-150 flex items-center gap-3 ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Active Accent Indicator */}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-600" />
                    )}

                    {/* Clean Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={place.image_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&q=80';
                        }}
                      />
                      {place.featured === 1 && (
                        <span className="absolute top-1 left-1 bg-amber-400 text-slate-950 text-[8.5px] font-bold px-1 rounded shadow-xs">
                          ★
                        </span>
                      )}
                    </div>

                    {/* Metadata & Typography */}
                    <div className="flex-1 min-w-0">
                      {/* Category & Province inline */}
                      <div className="flex items-center gap-1.5 text-[11px] mb-0.5 truncate">
                        <span className="font-semibold text-sky-600 truncate">{place.category}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 truncate">{place.province.replace(' Province', '')}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-[13px] group-hover:text-sky-600 transition-colors truncate leading-tight">
                        {place.name}
                      </h4>

                      <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                        <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{place.location}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800 text-[11px]">{place.rating}</span>
                          <span className="text-[10px] text-slate-400">({place.review_count})</span>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-sky-600 flex items-center gap-0.5 transition-colors">
                          <span>Pin</span>
                          <Navigation size={9} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ━━━━ MAIN AREA: LARGE INTERACTIVE MAP ━━━━ */}
        <main
          className={`flex-1 h-full relative overflow-hidden bg-slate-100 ${
            mobileTab === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
              <span className="text-xs font-semibold">Loading map coordinates...</span>
            </div>
          ) : (
            <InteractiveMap
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => setSelectedPlace(place)}
              recenterTrigger={recenterCount}
              onResetView={() => {
                setSelectedPlace(null);
                setRecenterCount((c) => c + 1);
              }}
            />
          )}

          {/* ━━━━ TOP-RIGHT FLOATING CONTROLS: TRIP ITINERARY TOGGLE ━━━━ */}
          <div className="absolute top-4 right-4 z-[1001] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTripPanelOpen(!isTripPanelOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all backdrop-blur-md cursor-pointer ${
                isTripPanelOpen
                  ? 'bg-[#0284C7] text-white border border-[#0284C7]'
                  : 'bg-white/95 hover:bg-white text-[#0F2A3D] border border-[#DCE8F2]'
              }`}
            >
              <Compass className={`w-4 h-4 ${isTripPanelOpen ? 'text-white' : 'text-[#0284C7]'}`} />
              <span className="hidden sm:inline">Trip Itinerary</span>
              {activeTrip && (activeTrip.items?.length || 0) > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isTripPanelOpen ? 'bg-white/20 text-white' : 'bg-[#DCEFFD] text-[#0284C7]'
                }`}>
                  {activeTrip.items?.length}
                </span>
              )}
            </button>
          </div>

          {/* ━━━━ TRIP ITINERARY SIDE PANEL (Desktop Right Drawer / Mobile Bottom Sheet) ━━━━ */}
          {isTripPanelOpen && (
            <div className="absolute inset-y-0 right-0 z-[1002] w-full sm:w-88 bg-white/95 backdrop-blur-xl border-l border-[#DCE8F2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
              {/* Panel Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#DCEFFD] flex items-center justify-center text-[#0284C7]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F2A3D] truncate max-w-[180px]">
                      {activeTrip ? activeTrip.title : 'My Trip Itinerary'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {activeTrip?.items?.length || 0} stops planned
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTripPanelOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {activeTrip && (activeTrip.items?.length || 0) > 0 && (
                <div className="px-4 py-2.5 bg-sky-50/40 border-b border-sky-100/60">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>
                      Visited: {(activeTrip.items || []).filter((i) => i.is_visited).length} of{' '}
                      {activeTrip.items?.length || 0}
                    </span>
                    <span className="font-bold text-[#0284C7]">
                      {Math.round(
                        (((activeTrip.items || []).filter((i) => i.is_visited).length) /
                          (activeTrip.items?.length || 1)) *
                          100
                      )}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (((activeTrip.items || []).filter((i) => i.is_visited).length) /
                            (activeTrip.items?.length || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Stops Checklist */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {!activeTrip || !activeTrip.items || activeTrip.items.length === 0 ? (
                  <div className="py-12 text-center px-4">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-sky-50 flex items-center justify-center text-xl">
                      📍
                    </div>
                    <p className="text-xs font-bold text-slate-800">No stops added yet</p>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">
                      Select any destination on the left or map to add it to your trip.
                    </p>
                    <Link
                      href="/trips"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:underline"
                    >
                      Open Trip Planner
                    </Link>
                  </div>
                ) : (
                  activeTrip.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                        item.is_visited
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-[#DCE8F2] shadow-2xs'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleVisited(activeTrip.id, item.id)}
                        className={`mt-0.5 p-0.5 rounded transition-colors ${
                          item.is_visited ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {item.is_visited ? (
                          <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Square className="w-4 h-4 stroke-[2]" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-[#0284C7] w-4">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-xs font-bold truncate ${
                              item.is_visited ? 'line-through text-slate-400' : 'text-[#0F2A3D]'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        {item.place && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 pl-5">
                            <span>{item.place.category || 'Destination'}</span>
                            {item.place.province && <span>• {item.place.province}</span>}
                          </div>
                        )}
                      </div>

                      {/* Center on map button if geo */}
                      {item.place && item.place.latitude && item.place.longitude && (
                        <button
                          type="button"
                          onClick={() => {
                            const found = places.find((p) => p.id === item.place_id);
                            if (found) {
                              setSelectedPlace(found);
                            }
                          }}
                          title="Locate on map"
                          className="p-1 text-slate-400 hover:text-[#0284C7] rounded"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Panel Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <Link
                  href="/trips"
                  className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1"
                >
                  Full Planner View
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsTripPanelOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Floating Map Legend / Guide on bottom right */}
          <div className="absolute bottom-9 sm:bottom-10 right-4 sm:right-6 z-[1001] hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#DCE8F2] rounded-2xl p-2.5 shadow-md text-xs font-semibold text-[#0F2A3D]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#38A9F0] px-2">Legend</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-[#5B7385]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38A9F0]" /> Beaches
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#5B7385]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> Mountains
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#5B7385]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Waterfalls
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#5B7385]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2FB67C]" /> Wildlife
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#5B7385]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" /> Historical
              </span>
            </div>
          </div>

          {/* Mobile Selected Place Bottom Preview Card */}
          {selectedPlace && mobileTab === 'map' && (
            <div className="lg:hidden absolute bottom-5 inset-x-3 z-[1002] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 p-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPlace.image_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                    {selectedPlace.category}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] font-black text-slate-900">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {selectedPlace.rating}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                  {selectedPlace.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedPlace.location}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  aria-label="Close preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <Link
                  href={`/places/${selectedPlace.id}`}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all text-center shadow-xs"
                >
                  View
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
