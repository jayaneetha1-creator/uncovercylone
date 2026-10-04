/**
 * src/components/TripRecommendationsRow.tsx
 * Co-occurrence suggestions inside the trip planner:
 * "Travelers who planned this trip also added..."
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TripCoOccurrenceSuggestion, TripPlace } from '@/lib/trips/constants';
import { useTrips } from '@/context/TripContext';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Sparkles, Star, MapPin } from 'lucide-react';

interface TripRecommendationsRowProps {
  currentPlaceIds: number[];
  tripId: number;
}

export function TripRecommendationsRow({ currentPlaceIds, tripId }: TripRecommendationsRowProps) {
  const { addPlaceToTrip, isInActiveTrip } = useTrips();
  const [suggestions, setSuggestions] = useState<TripCoOccurrenceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const query = currentPlaceIds.length > 0 ? `?placeIds=${currentPlaceIds.join(',')}` : '';
        const res = await fetch(`/api/trips/recommendations${query}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [currentPlaceIds]);

  if (loading && suggestions.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-[#DCE8F2]">
        <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-[#DCE8F2]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-[#0F2A3D]">
            Travelers Who Planned This Also Added
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Based on co-occurrence itineraries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {suggestions.map((item) => {
          const isAdded = isInActiveTrip(item.place.id);

          return (
            <div
              key={item.place.id}
              className="group relative bg-white rounded-2xl border border-[#DCE8F2] overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                  {item.place.image_url ? (
                    <Image
                      src={item.place.image_url}
                      alt={item.place.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 250px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                  {item.place.rating && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.place.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                    <MapPin className="w-3 h-3 text-[#38A9F0]" />
                    <span className="truncate">{item.place.province || item.place.category || 'Sri Lanka'}</span>
                  </div>
                  <Link
                    href={`/places/${item.place.id}`}
                    className="font-bold text-sm text-[#0F2A3D] hover:text-[#0284C7] line-clamp-1 transition-colors"
                  >
                    {item.place.name}
                  </Link>
                  <p className="text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md mt-1.5 inline-block font-medium">
                    {item.reason}
                  </p>
                </div>
              </div>

              {/* Add to Trip Action */}
              <div className="p-3 pt-0">
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => addPlaceToTrip(tripId, item.place)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isAdded
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-[#DCEFFD] hover:bg-[#38A9F0] text-[#0284C7] hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  {isAdded ? 'Already Added' : 'Add to Trip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
