'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Waves, Mountain, Droplets, PawPrint, Landmark,
  Castle, Sparkles, MapPin, Compass
} from 'lucide-react';

interface PlaceImageProps {
  src?: string | null;
  alt?: string;
  placeName: string;
  category?: string;
  location?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1' | 'auto';
}

function renderCategoryIcon(category?: string) {
  const cat = (category || '').toLowerCase();
  const cls = "w-6 h-6 stroke-[1.8]";
  if (cat.includes('beach')) return <Waves className={cls} />;
  if (cat.includes('mountain') || cat.includes('hill')) return <Mountain className={cls} />;
  if (cat.includes('waterfall') || cat.includes('fall')) return <Droplets className={cls} />;
  if (cat.includes('wildlife') || cat.includes('safari')) return <PawPrint className={cls} />;
  if (cat.includes('ancient') || cat.includes('ruin')) return <Landmark className={cls} />;
  if (cat.includes('historical') || cat.includes('fort')) return <Castle className={cls} />;
  if (cat.includes('gem')) return <Sparkles className={cls} />;
  return <Compass className={cls} />;
}

export default function PlaceImage({
  src,
  alt,
  placeName,
  category = 'Destination',
  location,
  fill = true,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  aspectRatio = '4/3',
}: PlaceImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no source provided or error occurred, show branded light-blue fallback
  const isFallback = !src || src.trim().length === 0 || hasError;

  const descriptiveAlt =
    alt || `${placeName} — ${category} in ${location ? `${location}, ` : ''}Sri Lanka`;

  const aspectClass =
    aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : '';

  if (isFallback) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#EAF4FD] via-[#F0F7FD] to-[#DCEFFD] flex flex-col items-center justify-center text-center p-4 border border-[#DCE8F2]/60 select-none ${aspectClass} ${className}`}
        role="img"
        aria-label={descriptiveAlt}
      >
        {/* Soft geometric accent circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#38A9F0]/10 blur-xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-[#38A9F0]/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#DCE8F2] flex items-center justify-center text-[#38A9F0]">
            {renderCategoryIcon(category)}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#38A9F0]">
            {category}
          </span>
          <span className="text-xs font-bold text-[#0F2A3D] line-clamp-1 max-w-[85%]">
            {placeName}
          </span>
          <span className="text-[10px] text-[#5B7385] flex items-center gap-1 font-medium">
            <MapPin className="w-3 h-3 text-[#38A9F0]" />
            <span>Sri Lanka Guide</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#EAF4FD] ${aspectClass}`}>
      {/* Light-blue shimmer skeleton loader while loading */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#EAF4FD] via-[#DCEFFD] to-[#EAF4FD] animate-pulse" />
      )}

      <Image
        src={src}
        alt={descriptiveAlt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        unoptimized={true}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`object-cover transition-transform duration-500 ease-out will-change-transform ${
          isLoading ? 'scale-105 blur-xs' : 'scale-100 blur-0'
        } ${className}`}
      />
    </div>
  );
}
