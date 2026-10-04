'use client';

/**
 * src/components/RecommendationCarousel.tsx
 * Multi-factor recommendation carousel ("Nearby & you might like").
 * Shows explainable human-readable reason tags and integrates with analytics.
 */

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Heart, Compass, MapPin } from 'lucide-react';
import { RecommendedPlace } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { trackPlaceClick, getAnonymousSessionId } from '@/lib/analytics';

interface RecommendationCarouselProps {
  currentPlaceId?: number;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function RecommendationCarousel({
  currentPlaceId,
  title = 'Nearby & You Might Like',
  subtitle = 'Curated recommendations based on distance, traveler journeys, and popularity',
  limit = 6,
}: RecommendationCarouselProps) {
  const [places, setPlaces] = useState<RecommendedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isSaved, toggleSave } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    async function fetchRecs() {
      try {
        setLoading(true);
        const sid = getAnonymousSessionId();
        let url = `/api/recommendations?limit=${limit}&sessionId=${encodeURIComponent(sid)}`;
        if (currentPlaceId) {
          url += `&placeId=${currentPlaceId}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        if (isMounted && data.recommendations) {
          setPlaces(data.recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [currentPlaceId, limit]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] w-[280px] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm animate-pulse">
              <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl mb-3" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#38A9F0]" />
            <h2 className="text-xl font-bold text-[#0F2A3D]">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-[#5B7385] mt-0.5">{subtitle}</p>}
        </div>

        {/* Carousel arrows (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[#5B7385] hover:bg-slate-50 transition active:scale-95"
            aria-label="Previous recommendations"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[#5B7385] hover:bg-slate-50 transition active:scale-95"
            aria-label="Next recommendations"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {places.map((place) => {
          const saved = isSaved(place.id);
          return (
            <div
              key={place.id}
              className="min-w-[260px] sm:min-w-[280px] max-w-[280px] bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition group overflow-hidden flex flex-col snap-start"
            >
              {/* Image & Reason Pill */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                <Link
                  href={`/places/${place.id}`}
                  onClick={() => trackPlaceClick(place.id, 'recommendation_carousel')}
                  className="block w-full h-full"
                >
                  <Image
                    src={place.image_url || '/placeholder.jpg'}
                    alt={place.name}
                    fill
                    sizes="(max-width: 768px) 260px, 280px"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>

                {/* Reason tag */}
                <div className="absolute top-2.5 left-2.5 max-w-[85%] bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-semibold text-[#0F2A3D] shadow-sm truncate border border-slate-200/50">
                  {place.reason}
                </div>

                {/* Save Heart */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(place.id);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition active:scale-95"
                  aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 transition ${
                      saved ? 'fill-red-500 text-red-500' : 'text-slate-700'
                    }`}
                  />
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-xs text-[#5B7385] mb-1">
                  <span className="font-medium text-[#38A9F0]">{place.category}</span>
                  <span>•</span>
                  <span className="truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {place.province}
                  </span>
                </div>

                <Link
                  href={`/places/${place.id}`}
                  onClick={() => trackPlaceClick(place.id, 'recommendation_carousel')}
                  className="font-bold text-[#0F2A3D] text-sm hover:text-[#38A9F0] line-clamp-1 mb-1.5 transition"
                >
                  {place.name}
                </Link>

                <p className="text-xs text-[#5B7385] line-clamp-2 mb-3 flex-1">
                  {place.short_description || place.description}
                </p>

                {/* Footer ratings and fee */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                    <span className="font-semibold text-slate-800">
                      {place.rating ? place.rating.toFixed(1) : '4.5'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({place.review_count || 0})
                    </span>
                  </div>

                  <span className="font-medium text-slate-600">
                    {place.entry_fee || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
