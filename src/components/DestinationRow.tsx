'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Place } from '@/types';
import {
  Star, MapPin, Calendar, Heart, Eye, ArrowRight,
  Sparkles, CheckCircle2, Ticket, MessageSquare, Compass
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { trackPlaceClick, trackPlaceSave } from '@/lib/analytics';

interface DestinationRowProps {
  place: Place;
  rank: number;
  reviewSnippets?: string[];
  distanceKm?: number | null;
}

export default function DestinationRow({
  place,
  rank,
  reviewSnippets = [],
  distanceKm,
}: DestinationRowProps) {
  const { isSaved, toggleSave } = useWishlist();
  const { t } = useLanguage();
  const saved = isSaved(place.id);
  const [imgError, setImgError] = useState(false);

  // Fallback image url if missing or broken
  const displayImage = imgError || !place.image_url || place.image_url.trim().length === 0
    ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
    : place.image_url;

  return (
    <article className="group bg-white rounded-3xl border border-[#DCE8F2] hover:border-[#38A9F0]/40 shadow-[0_2px_12px_rgba(15,42,61,0.03)] hover:shadow-[0_8px_30px_rgba(56,169,240,0.12)] transition-all duration-200 overflow-hidden flex flex-col md:flex-row">
      
      {/* ━━━ LEFT: PHOTO CAROUSEL / THUMBNAIL (4:3) ━━━ */}
      <div className="relative w-full md:w-[280px] lg:w-[320px] aspect-[4/3] md:aspect-auto flex-shrink-0 bg-[#EAF4FD] overflow-hidden">
        <Image
          src={displayImage}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 320px, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgError(true)}
          priority={rank <= 3}
        />

        {/* Rank Badge */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2A3D]/80 backdrop-blur-md text-white text-xs font-black shadow-sm">
          <span>#{rank}</span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(place.id);
            if (!saved) trackPlaceSave(place.id);
          }}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer ${
            saved
              ? 'bg-[#E5484D] text-white'
              : 'bg-white/85 backdrop-blur-md text-[#5B7385] hover:text-[#E5484D] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
        </button>

        {/* Category Pill Over Image on Mobile */}
        <div className="absolute bottom-3.5 left-3.5 z-10 md:hidden">
          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-bold text-[#0F2A3D]">
            {place.category}
          </span>
        </div>
      </div>

      {/* ━━━ RIGHT: CONTENT & DETAILS ━━━ */}
      <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
        <div>
          {/* Top Row: Category + Province + Season */}
          <div className="hidden md:flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold border border-[#DCEFFD]">
              {place.category}
            </span>
            <span className="text-[#5B7385] text-xs font-medium">·</span>
            <span className="text-[#5B7385] text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#38A9F0]" />
              {place.province || place.location}
            </span>
            {place.best_time && (
              <>
                <span className="text-[#5B7385] text-xs font-medium">·</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5FAFF] text-[#0F2A3D] text-[11px] font-semibold border border-[#DCE8F2]">
                  <Calendar className="w-3 h-3 text-[#38A9F0]" />
                  <span>{place.best_time}</span>
                </span>
              </>
            )}
          </div>

          {/* Heading / Title */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link
              href={`/places/${place.id}`}
              onClick={() => trackPlaceClick(place.id, 'destinations_directory')}
              className="text-lg sm:text-xl font-black text-[#0F2A3D] hover:text-[#38A9F0] transition-colors leading-snug tracking-tight"
            >
              {rank}. {place.name}
            </Link>
          </div>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <div className="flex items-center gap-1 bg-[#FFF9E6] px-2.5 py-1 rounded-lg border border-[#FFE8A3]">
              <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
              <span className="text-xs font-black text-[#0F2A3D]">
                {Number(place.rating || 5.0).toFixed(1)}
              </span>
            </div>
            <Link
              href={`/places/${place.id}#reviews`}
              className="text-xs text-[#5B7385] hover:text-[#38A9F0] font-medium underline-offset-2 hover:underline transition-colors"
            >
              ({place.review_count || 0} {place.review_count === 1 ? 'review' : 'reviews'})
            </Link>
            {distanceKm !== undefined && distanceKm !== null && (
              <span className="text-xs text-[#2FB67C] font-semibold bg-[#EAFBF3] px-2 py-0.5 rounded-md border border-[#C3F4DE]">
                {distanceKm < 1 ? '< 1 km away' : `${distanceKm.toFixed(1)} km away`}
              </span>
            )}
            {place.entry_fee && (
              <span className="text-xs text-[#5B7385] font-medium flex items-center gap-1">
                <Ticket className="w-3 h-3 text-[#38A9F0]" />
                {place.entry_fee.toLowerCase().includes('free') ? 'Free Entry' : place.entry_fee}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#5B7385] line-clamp-2 leading-relaxed mb-4">
            {place.short_description || place.description}
          </p>

          {/* Real Review Snippets (Section 4.6-B: "2 short real review snippets if reviews exist") */}
          {reviewSnippets && reviewSnippets.length > 0 && (
            <div className="space-y-1.5 mb-4 pt-2 border-t border-[#F0F5FA]">
              {reviewSnippets.slice(0, 2).map((snippet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#5B7385]">
                  <MessageSquare className="w-3 h-3 text-[#38A9F0] flex-shrink-0 mt-0.5" />
                  <span className="italic line-clamp-1">&ldquo;{snippet}&rdquo;</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ━━━ BOTTOM ACTION BAR ━━━ */}
        <div className="pt-3 border-t border-[#DCE8F2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F2A3D]">
              {place.location}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/places/${place.id}`}
              onClick={() => trackPlaceClick(place.id, 'destinations_directory')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </article>
  );
}
