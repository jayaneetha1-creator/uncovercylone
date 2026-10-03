'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Compass, ArrowRight, Trash2, MapPin, Sparkles, Share2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Place } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import PlaceCardSkeleton from '@/components/PlaceCardSkeleton';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { savedIds, clearWishlist } = useWishlist();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/places')
      .then((res) => res.json())
      .then((data) => {
        if (data.places) {
          setPlaces(data.places);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const savedPlaces: Place[] = places.filter((p) => savedIds.includes(p.id));
  const savedCount = savedIds.length;

  const handleShareList = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator
        .share({
          title: 'My UncoverCeylon Saved Places',
          text: `Check out my curated travel list of ${savedCount} destinations across Sri Lanka!`,
          url: window.location.href,
        })
        .catch(() => undefined);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('List link copied to clipboard!');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your saved destinations?')) {
      clearWishlist();
      toast.success('Saved destinations cleared');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] pt-24 pb-24 text-[#0F2A3D]">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-[#EAF4FD] rounded-xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#0F2A3D] pt-24 pb-28">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-[#DCE8F2] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider mb-2 border border-[#DCEFFD]">
              <Heart className="w-3.5 h-3.5 fill-[#38A9F0]" />
              <span>Personal Itinerary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F2A3D] tracking-tight">
              Saved Destinations
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5B7385]">
              {savedCount > 0
                ? `You have saved ${savedCount} ${savedCount === 1 ? 'destination' : 'destinations'} to your travel collection.`
                : 'Keep track of the places you want to visit across Sri Lanka.'}
            </p>
          </div>

          {savedCount > 0 && (
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleShareList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DCE8F2] hover:border-[#38A9F0] text-[#0F2A3D] hover:text-[#38A9F0] text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share List</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DCE8F2] hover:border-[#E5484D] text-[#5B7385] hover:text-[#E5484D] text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Saved List or Empty State */}
        {savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {savedPlaces.map((place: Place, index: number) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md bg-white border border-[#DCE8F2] rounded-3xl p-10 text-center shadow-xs">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#EAF4FD] border border-[#DCEFFD] flex items-center justify-center text-[#38A9F0] mb-5">
              <Heart className="w-8 h-8 text-[#38A9F0]" />
            </div>

            <h2 className="text-xl font-bold text-[#0F2A3D]">Your collection is empty</h2>

            <p className="mt-2 text-xs sm:text-sm text-[#5B7385] leading-relaxed">
              When exploring destinations, tap the heart button on any place card to save it here for
              offline planning and quick access.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#38A9F0]/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] text-[#0F2A3D] font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#38A9F0]" />
                <span>Open Map</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
