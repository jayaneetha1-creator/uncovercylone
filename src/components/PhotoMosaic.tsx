'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X, ChevronLeft, ChevronRight, Grid,
  Maximize2, Image as ImageIcon
} from 'lucide-react';

interface PhotoMosaicProps {
  images: string[];
  title: string;
}

export default function PhotoMosaic({ images = [], title }: PhotoMosaicProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter out empty or duplicate strings
  const validImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  const fallback = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80';
  const displayImages = validImages.length > 0 ? validImages : [fallback];

  const primaryPhoto = displayImages[0];
  const sidePhotos = displayImages.slice(1, 5);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % displayImages.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + displayImages.length) % displayImages.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, displayImages.length]);

  return (
    <div className="relative w-full">
      
      {/* ━━━ DESKTOP MOSAIC (1 LARGE + 4 SMALL) ━━━ */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shadow-xs">
        
        {/* Main Hero Photo (Left 2 cols, spans 2 rows) */}
        <div
          onClick={() => setLightboxIndex(0)}
          className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden bg-[#EAF4FD]"
        >
          <Image
            src={primaryPhoto}
            alt={`${title} main view`}
            fill
            priority
            sizes="(max-width: 1200px) 50vw, 600px"
            className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click to enlarge</span>
          </div>
        </div>

        {/* Small Photos (Right 2 cols, 2x2 grid) */}
        {[0, 1, 2, 3].map((idx) => {
          const photoUrl = sidePhotos[idx] || primaryPhoto;
          const isLast = idx === 3;
          const targetIndex = idx + 1 < displayImages.length ? idx + 1 : 0;

          return (
            <div
              key={idx}
              onClick={() => setLightboxIndex(targetIndex)}
              className="relative group cursor-pointer overflow-hidden bg-[#EAF4FD]"
            >
              <Image
                src={photoUrl}
                alt={`${title} photo ${idx + 2}`}
                fill
                sizes="(max-width: 1200px) 25vw, 300px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

              {/* "See all photos" button on last tile */}
              {isLast && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-3 text-center transition-all group-hover:bg-black/55">
                  <Grid className="w-6 h-6 mb-1 text-[#38A9F0]" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    See All Photos
                  </span>
                  <span className="text-[11px] text-white/80 font-medium mt-0.5">
                    ({displayImages.length} images)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ━━━ MOBILE SWIPE CAROUSEL (NEIGHBORS PEEKING) ━━━ */}
      <div className="md:hidden relative w-full overflow-hidden">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 py-1">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="relative min-w-[82vw] aspect-[4/3] rounded-2xl overflow-hidden snap-center flex-shrink-0 bg-[#EAF4FD] shadow-xs active:scale-98 transition-transform"
            >
              <Image
                src={img}
                alt={`${title} view ${idx + 1}`}
                fill
                sizes="85vw"
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                {idx + 1} / {displayImages.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ LIGHTBOX MODAL ━━━ */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fade-in"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 z-10">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {title}
              </h4>
              <p className="text-xs text-white/60">
                Photo {lightboxIndex + 1} of {displayImages.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo lightbox"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Main Photo with Nav Chevrons */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-full max-h-[75vh]">
              <Image
                src={displayImages[lightboxIndex]}
                alt={`${title} large view`}
                fill
                sizes="(max-width: 1200px) 95vw, 1200px"
                className="object-contain"
                priority
              />
            </div>

            {/* Prev Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (prev) => (prev !== null ? (prev - 1 + displayImages.length) % displayImages.length : 0)
                  )
                }
                aria-label="Previous photo"
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (prev) => (prev !== null ? (prev + 1) % displayImages.length : 0)
                  )
                }
                aria-label="Next photo"
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="p-3 sm:p-4 bg-black/40 border-t border-white/10 overflow-x-auto no-scrollbar flex items-center justify-center gap-2">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                  lightboxIndex === idx ? 'border-[#38A9F0] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="Thumbnail" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
