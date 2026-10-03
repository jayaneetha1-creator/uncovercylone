'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ChevronLeft, ChevronRight, Waves, Mountain,
  Droplets, PawPrint, Landmark, Sparkles
} from 'lucide-react';
import { Place } from '@/types';
import PlaceImage from '@/components/PlaceImage';

interface JourneyCategoriesSectionProps {
  places: Place[];
}

interface InterestCategory {
  title: string;
  category: string;
  tagline: string;
  image: string;
  icon: React.ElementType;
}

const INTEREST_TILES: InterestCategory[] = [
  {
    title: 'Coast & Golden Beaches',
    category: 'Beaches',
    tagline: 'Warm ocean breaks, whale safaris & quiet palm bays',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    icon: Waves,
  },
  {
    title: 'Highlands & Misty Peaks',
    category: 'Mountains',
    tagline: 'Scenic rail viaducts, cloud forests & tea estates',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    icon: Mountain,
  },
  {
    title: 'Secret Cascades & Falls',
    category: 'Waterfalls',
    tagline: 'Natural rock pools, roaring falls & river treks',
    image: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=800&q=80',
    icon: Droplets,
  },
  {
    title: 'Wild Sanctuaries & Safaris',
    category: 'Wildlife',
    tagline: 'Leopard tracking, wild elephant herds & birds',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80',
    icon: PawPrint,
  },
  {
    title: 'Ancient Citadels & Ruined Cities',
    category: 'Ancient Sites',
    tagline: 'Sky fortresses, rock-cut shrines & royal moats',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    icon: Landmark,
  },
  {
    title: 'Hidden Gems & Local Secrets',
    category: 'Hidden Gems',
    tagline: 'Lesser-trodden footpaths & panoramic ridge points',
    image: 'https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=800&q=80',
    icon: Sparkles,
  },
];

export default function JourneyCategoriesSection({ places }: JourneyCategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCount = (cat: string) =>
    places.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase())).length;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryQuery: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('uc:filter-category', { detail: { category: categoryQuery } })
      );
      const exploreEl = document.getElementById('explore');
      if (exploreEl) {
        exploreEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F5FAFF] border-b border-[#DCE8F2]/60 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Arrow Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#DCEFFD] text-[#1E93DC] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2.5 border border-[#38A9F0]/20">
              <Sparkles className="w-3 h-3 text-[#38A9F0]" />
              <span>Find Things by Interest</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2A3D] tracking-tight">
              What kind of island trip do you imagine?
            </h2>
            <p className="mt-1.5 text-xs sm:text-base text-[#5B7385] max-w-xl">
              Select an experience style to view curated places with verified locations and real travel advice.
            </p>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="p-2.5 rounded-full bg-white hover:bg-[#EAF4FD] border border-[#DCE8F2] text-[#0F2A3D] transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="p-2.5 rounded-full bg-white hover:bg-[#EAF4FD] border border-[#DCE8F2] text-[#0F2A3D] transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll-Snap Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
        >
          {INTEREST_TILES.map((tile) => {
            const count = getCount(tile.category);
            const Icon = tile.icon;

            return (
              <div
                key={tile.category}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start"
              >
                <Link
                  href={`/?category=${encodeURIComponent(tile.category)}#explore`}
                  onClick={() => handleCategoryClick(tile.category)}
                  className="group block relative h-[380px] rounded-2xl overflow-hidden border border-[#DCE8F2] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#38A9F0]/15"
                >
                  {/* Photo with PlaceImage */}
                  <div className="absolute inset-0 z-0">
                    <PlaceImage
                      src={tile.image}
                      placeName={tile.title}
                      category={tile.category}
                      aspectRatio="auto"
                      className="transition-transform duration-700 ease-out group-hover:scale-104"
                    />
                    {/* Serene bottom gradient overlay for crystal clear typography */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A3D]/90 via-[#0F2A3D]/40 to-transparent" />
                  </div>

                  {/* Top Category Badge & Real Count */}
                  <div className="relative z-10 p-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-bold text-[#0F2A3D] shadow-xs border border-[#DCE8F2]">
                      <Icon className="w-3.5 h-3.5 text-[#38A9F0]" />
                      <span>{tile.category}</span>
                    </span>

                    <span className="bg-[#0F2A3D]/80 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {count} {count === 1 ? 'place' : 'places'}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-0 inset-x-0 z-10 p-5 space-y-1.5 text-white">
                    <h3 className="text-xl font-bold tracking-tight leading-snug group-hover:text-[#38A9F0] transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                      {tile.tagline}
                    </p>
                    <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#38A9F0] group-hover:translate-x-1 transition-transform">
                      <span>Explore {tile.category}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
