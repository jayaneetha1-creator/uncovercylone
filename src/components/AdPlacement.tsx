'use client';

/**
 * src/components/AdPlacement.tsx
 * Universal renderer for the 5 non-disruptive ad placements.
 * Zero-gap rule: Returns null when OFF or empty (0 empty space / no residual layout).
 * Clearly labeled "Sponsored" or "Partner", tracks impressions & clicks.
 */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ExternalLink, Sparkles, Tag, ChevronRight, Compass } from 'lucide-react';
import { Ad } from '@/types';

interface AdPlacementProps {
  placement: 'grid_card' | 'home_banner' | 'sidebar_partner' | 'carousel_slot' | 'footer_strip';
  className?: string;
}

export default function AdPlacement({ placement, className = '' }: AdPlacementProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hasImpressionFired, setHasImpressionFired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAd() {
      try {
        const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
        const res = await fetch(`/api/ads?placement=${placement}&device=${device}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.enabled && data.ads && data.ads.length > 0) {
          // Pick the first active ad for this placement
          setAd(data.ads[0]);
          setEnabled(true);
        } else if (isMounted) {
          setEnabled(false);
          setAd(null);
        }
      } catch (err) {
        console.error('Error loading ad placement:', err);
      }
    }

    fetchAd();
    return () => {
      isMounted = false;
    };
  }, [placement]);

  // Track impression when ad enters viewport
  useEffect(() => {
    if (!ad || hasImpressionFired || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasImpressionFired) {
            setHasImpressionFired(true);
            fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {});
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [ad, hasImpressionFired]);

  const handleClick = (e: React.MouseEvent) => {
    if (!ad) return;
    fetch(`/api/ads/${ad.id}/click`, { method: 'POST', keepalive: true }).catch(() => {});
  };

  // Zero-gap rule: If disabled or no ad, render nothing
  if (!enabled || !ad) {
    return null;
  }

  // ━━━ 1. SPONSORED PLACE CARD (GRID) ━━━
  if (placement === 'grid_card') {
    return (
      <div ref={containerRef} className={`h-full w-full ${className}`}>
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#38A9F0]/30 bg-gradient-to-b from-white to-[#F5FAFF] transition-all duration-200 hover:border-[#38A9F0] hover:shadow-lg hover:shadow-[#38A9F0]/15 hover:-translate-y-1 active:scale-[0.99] relative"
        >
          {/* Media */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAF4FD]">
            {ad.image_url ? (
              <Image
                src={ad.image_url}
                alt={ad.title_en}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#EAF4FD] text-[#38A9F0]">
                <Compass className="w-10 h-10 stroke-[1.5]" />
              </div>
            )}

            {/* Sponsored Pill Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#0F2A3D] shadow-sm border border-slate-200/60">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              <span>Sponsored</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5B7385] mb-1.5">
                <span className="font-semibold text-[#38A9F0] uppercase tracking-wider text-[11px]">
                  Partner Experience
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <span>Visit site</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#38A9F0] transition" />
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F2A3D] group-hover:text-[#38A9F0] transition-colors line-clamp-1 mb-1.5">
                {ad.title_en}
              </h3>

              <p className="text-xs text-[#5B7385] line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DCE8F2] flex items-center justify-between text-xs font-semibold text-[#38A9F0]">
              <span>Explore Official Partner</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </a>
      </div>
    );
  }

  // ━━━ 2. SLIM HOMEPAGE BANNER ━━━
  if (placement === 'home_banner') {
    return (
      <div ref={containerRef} className={`w-full ${className}`}>
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="group relative block overflow-hidden rounded-2xl border border-[#38A9F0]/30 bg-gradient-to-r from-[#EAF4FD] via-[#F5FAFF] to-[#E5F2FC] p-4 sm:p-5 shadow-xs hover:border-[#38A9F0] hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {ad.image_url && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-[#DCE8F2]">
                    <Image
                      src={ad.image_url}
                      alt={ad.title_en}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#0F2A3D] text-[10px] font-bold uppercase tracking-wider border border-[#DCE8F2]">
                      Partner Spotlight
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0F2A3D] group-hover:text-[#38A9F0] transition">
                    {ad.title_en}
                  </h4>
                  <p className="text-xs text-[#5B7385] mt-0.5 line-clamp-1 max-w-xl">
                    {ad.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#38A9F0] bg-white px-3.5 py-2 rounded-xl border border-[#DCE8F2] shadow-2xs self-start sm:self-auto group-hover:bg-[#38A9F0] group-hover:text-white transition">
                <span>Learn More</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  }

  // ━━━ 3. PLACE DETAIL SIDEBAR PARTNER CARD ━━━
  if (placement === 'sidebar_partner') {
    return (
      <div ref={containerRef} className={className}>
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="group block rounded-2xl border border-[#DCE8F2] bg-white p-4 shadow-xs hover:border-[#38A9F0]/60 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#5B7385]">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              Partner Experience
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38A9F0] transition" />
          </div>

          {ad.image_url && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
              <Image
                src={ad.image_url}
                alt={ad.title_en}
                fill
                sizes="280px"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          )}

          <h5 className="font-bold text-sm text-[#0F2A3D] group-hover:text-[#38A9F0] transition line-clamp-1 mb-1">
            {ad.title_en}
          </h5>

          <p className="text-xs text-[#5B7385] line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </a>
      </div>
    );
  }

  // ━━━ 4. CAROUSEL SPONSORED ROW / CARD ━━━
  if (placement === 'carousel_slot') {
    return (
      <div
        ref={containerRef}
        className={`min-w-[260px] sm:min-w-[280px] max-w-[280px] bg-gradient-to-b from-[#F5FAFF] to-white rounded-2xl border border-[#38A9F0]/40 shadow-sm hover:shadow-md transition group overflow-hidden flex flex-col snap-start ${className}`}
      >
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="flex flex-col h-full"
        >
          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
            {ad.image_url ? (
              <Image
                src={ad.image_url}
                alt={ad.title_en}
                fill
                sizes="280px"
                className="object-cover group-hover:scale-105 transition duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#38A9F0]">
                <Compass className="w-10 h-10" />
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#0F2A3D] shadow-sm flex items-center gap-1 border border-slate-200/60">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              <span>Sponsored</span>
            </div>
          </div>

          <div className="p-3.5 flex flex-col flex-1">
            <span className="text-[11px] font-semibold text-[#38A9F0] mb-1 uppercase tracking-wider">
              Featured Partner
            </span>

            <h5 className="font-bold text-[#0F2A3D] text-sm group-hover:text-[#38A9F0] line-clamp-1 mb-1.5 transition">
              {ad.title_en}
            </h5>

            <p className="text-xs text-[#5B7385] line-clamp-2 mb-3 flex-1">
              {ad.description}
            </p>

            <div className="pt-2 border-t border-slate-100 mt-auto flex items-center justify-between text-xs font-bold text-[#38A9F0]">
              <span>Visit Official Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>
      </div>
    );
  }

  // ━━━ 5. FOOTER PARTNER STRIP ━━━
  if (placement === 'footer_strip') {
    return (
      <div ref={containerRef} className={`w-full py-4 bg-[#EAF4FD] border-t border-[#DCE8F2] ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white font-bold text-[10px] text-[#0F2A3D] border border-[#DCE8F2] uppercase">
              Partner
            </span>
            <span className="font-semibold text-[#0F2A3D]">{ad.title_en}</span>
            <span className="text-slate-400 hidden md:inline">—</span>
            <span className="text-[#5B7385] hidden md:inline">{ad.description}</span>
          </div>

          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 font-bold text-[#38A9F0] hover:text-[#1E93DC] transition"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
