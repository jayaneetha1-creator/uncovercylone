'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Place } from '@/types';
import PlaceImage from '@/components/PlaceImage';
import WishlistButton from '@/components/WishlistButton';
import { AddToTripButton } from '@/components/AddToTripButton';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLocation } from '@/context/LocationContext';
import { trackPlaceClick } from '@/lib/analytics';

interface PlaceCardProps {
  place: Place;
  index?: number;
  variant?: 'grid' | 'horizontal';
}

function cleanFeeDisplay(fee: string): string {
  if (!fee) return 'Free';
  const lower = fee.toLowerCase().trim();
  if (lower === 'free' || lower === '0' || lower === 'none') return 'Free';

  // Extract primary price without long parenthetical text
  const match = fee.match(/^(USD\s*\d+|LKR\s*[\d,]+|\$\d+)/i);
  if (match) return match[0];
  if (fee.length > 14) return fee.substring(0, 12) + '...';
  return fee;
}

export default function PlaceCard({ place, variant = 'grid' }: PlaceCardProps) {
  const horizontal = variant === 'horizontal';
  const { t } = useLanguage();
  const { convertFee } = useCurrency();
  const { formatDistanceTo } = useLocation();

  const distanceInfo = formatDistanceTo(place.lat, place.lng, place.distance_km);
  const rawCleanFee = cleanFeeDisplay(place.entry_fee);
  const displayFee = place.entry_fee?.toLowerCase().includes('free')
    ? 'Free'
    : convertFee(rawCleanFee);

  return (
    <div className="h-full w-full">
      <Link
        href={`/places/${place.id}`}
        onClick={() => trackPlaceClick(place.id, 'place_card')}
        className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCE8F2] bg-white transition-all duration-200 hover:border-[#38A9F0]/50 hover:shadow-lg hover:shadow-[#38A9F0]/10 hover:-translate-y-1 active:scale-[0.99] ${
          horizontal ? 'sm:flex-row' : ''
        }`}
      >
        {/* Card Media Container */}
        <div
          className={`relative overflow-hidden bg-[#EAF4FD] ${
            horizontal ? 'aspect-[4/3] sm:w-2/5' : 'aspect-[4/3]'
          }`}
        >
          <PlaceImage
            src={place.image_url}
            placeName={place.name}
            category={place.category}
            location={place.location}
            aspectRatio="4/3"
            sizes={
              horizontal
                ? '(max-width: 640px) 100vw, 40vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
          />

          {/* Category Tag (Top-Left) */}
          <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 z-10 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#38A9F0] rounded-full shadow-xs border border-[#DCE8F2]">
              {place.category}
            </span>
          </div>

          {/* Action Buttons (Wishlist Heart + Add to Trip) (Top-Right) */}
          <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 z-20 flex items-center gap-1.5">
            <AddToTripButton place={place} variant="icon" />
            <WishlistButton placeId={place.id} placeName={place.name} variant="icon" />
          </div>

          {/* Seasonality / Best Month Badge (Bottom-Left) */}
          {place.best_time && (
            <div className="absolute left-2.5 bottom-2.5 sm:left-3 sm:bottom-3 z-10 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md text-[#0F2A3D] px-2.5 py-1 text-[9.5px] sm:text-[10.5px] font-bold rounded-full flex items-center gap-1.5 border border-[#DCE8F2] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] inline-block" />
                <span className="truncate max-w-[140px] sm:max-w-[170px]">{place.best_time}</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body & Key Facts */}
        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5">
          <div>
            {/* Location & Live Distance */}
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold text-[#5B7385] mb-1.5">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#38A9F0]" />
                <span className="truncate">{place.location}</span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] shrink-0 font-bold px-2 py-0.5 rounded-full ${
                  distanceInfo.isLive
                    ? 'bg-[#DCEFFD] text-[#1E93DC] border border-[#38A9F0]/30'
                    : 'text-[#5B7385] bg-[#EAF4FD]'
                }`}
              >
                {distanceInfo.text}
              </span>
            </div>

            {/* Destination Title (Max 2 lines, clean wrap) */}
            <h3 className="text-[15px] sm:text-[17px] font-extrabold leading-snug text-[#0F2A3D] group-hover:text-[#38A9F0] line-clamp-2 transition-colors">
              {place.name}
            </h3>

            {/* One-Line Descriptive Teaser */}
            <p className="mt-1.5 line-clamp-2 text-xs sm:text-[13px] leading-relaxed text-[#5B7385]">
              {place.short_description || place.description}
            </p>
          </div>

          {/* Card Footer: Rating, Price Chip & Action Cue */}
          <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-[#DCE8F2] pt-2.5 sm:pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Rating */}
              <span className="flex items-center gap-1 text-xs sm:text-[13px] font-bold text-[#0F2A3D]">
                <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
                <span>{place.rating.toFixed(1)}</span>
              </span>

              {/* Price Chip */}
              <span
                className={`text-[10.5px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  displayFee === 'Free'
                    ? 'bg-[#EAF4FD] text-[#1E93DC] border-[#DCEFFD]'
                    : 'bg-[#F5FAFF] text-[#0F2A3D] border-[#DCE8F2]'
                }`}
                title={place.entry_fee}
              >
                {displayFee}
              </span>
            </div>

            {/* Action Cue */}
            <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#38A9F0] group-hover:text-[#1E93DC] transition-colors">
              <span>{t('card.view') || 'Explore'}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
