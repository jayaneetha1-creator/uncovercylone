'use client';

import React, { useState } from 'react';
import { Place } from '@/types';
import {
  Ticket, Calendar, Clock, Compass, Navigation,
  Heart, CheckCircle2, ShieldCheck, MapPin, Footprints, DollarSign
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';
import { trackDirectionsClick, trackPlaceSave } from '@/lib/analytics';

interface PlanVisitCardProps {
  place: Place;
}

export default function PlanVisitCard({ place }: PlanVisitCardProps) {
  const [currency, setCurrency] = useState<'LKR' | 'USD'>('LKR');
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(place.id);

  // Parse fee if numeric, or display text
  const rawFee = place.entry_fee || 'Free Entry';
  const isFree = rawFee.toLowerCase().includes('free') || rawFee === '0';

  const formatFee = () => {
    if (isFree) return 'Free Entry';
    // If has digits, extract numeric part
    const matches = rawFee.match(/\d+[\d,]*/);
    if (!matches) return rawFee;

    const numLkr = parseInt(matches[0].replace(/,/g, ''), 10);
    if (currency === 'USD') {
      const usd = Math.max(1, Math.round(numLkr / 310));
      return `~ $${usd} USD / visitor`;
    }
    return `LKR ${numLkr.toLocaleString()} / visitor`;
  };

  const getDifficulty = () => {
    const cat = (place.category || '').toLowerCase();
    const name = (place.name || '').toLowerCase();
    if (name.includes('adam') || name.includes('rock') || cat.includes('mountain')) {
      return 'Moderate to Strenuous';
    }
    if (cat.includes('waterfall') || cat.includes('ancient')) {
      return 'Moderate';
    }
    return 'Easy Walk';
  };

  const openDirections = () => {
    trackDirectionsClick(place.id);
    if (place.lat && place.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', Sri Lanka')}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DCE8F2] p-6 lg:p-7 shadow-[0_4px_24px_rgba(15,42,61,0.06)] space-y-6">
      
      {/* ━━━ CARD HEADER: ENTRY FEE & CURRENCY TOGGLE ━━━ */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#5B7385]">
            Plan Your Visit
          </span>

          {!isFree && (
            <div className="flex items-center bg-[#F5FAFF] p-1 rounded-xl border border-[#DCE8F2] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCurrency('LKR')}
                className={`px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  currency === 'LKR' ? 'bg-[#38A9F0] text-white shadow-2xs' : 'text-[#5B7385]'
                }`}
              >
                LKR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-[#38A9F0] text-white shadow-2xs' : 'text-[#5B7385]'
                }`}
              >
                USD
              </button>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-black text-[#0F2A3D] tracking-tight">
            {formatFee()}
          </h3>
          {isFree && (
            <span className="text-xs font-bold text-[#2FB67C] bg-[#EAFBF3] px-2.5 py-0.5 rounded-md border border-[#C3F4DE]">
              No Ticket Required
            </span>
          )}
        </div>
      </div>

      {/* ━━━ KEY PRACTICAL VISIT FACTS ━━━ */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        
        {/* Best Season */}
        <div className="bg-[#F5FAFF] rounded-2xl p-3.5 border border-[#DCE8F2]">
          <div className="flex items-center gap-1.5 text-xs text-[#5B7385] font-bold mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#38A9F0]" />
            <span>Optimal Season</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#0F2A3D] leading-tight">
            {place.best_time || 'Year-round'}
          </p>
        </div>

        {/* Recommended Duration */}
        <div className="bg-[#F5FAFF] rounded-2xl p-3.5 border border-[#DCE8F2]">
          <div className="flex items-center gap-1.5 text-xs text-[#5B7385] font-bold mb-1">
            <Clock className="w-3.5 h-3.5 text-[#38A9F0]" />
            <span>Suggested Time</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#0F2A3D] leading-tight">
            2 – 3 Hours
          </p>
        </div>

        {/* Physical Difficulty */}
        <div className="bg-[#F5FAFF] rounded-2xl p-3.5 border border-[#DCE8F2]">
          <div className="flex items-center gap-1.5 text-xs text-[#5B7385] font-bold mb-1">
            <Footprints className="w-3.5 h-3.5 text-[#2FB67C]" />
            <span>Terrain / Trail</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#0F2A3D] leading-tight">
            {getDifficulty()}
          </p>
        </div>

        {/* Hours */}
        <div className="bg-[#F5FAFF] rounded-2xl p-3.5 border border-[#DCE8F2]">
          <div className="flex items-center gap-1.5 text-xs text-[#5B7385] font-bold mb-1">
            <Compass className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Opening Window</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#0F2A3D] leading-tight">
            6:00 AM – 6:00 PM
          </p>
        </div>

      </div>

      {/* ━━━ PRIMARY ACTION BUTTONS (FOGG TARGET BEHAVIOR) ━━━ */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={openDirections}
          className="w-full min-h-[48px] rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-sm font-bold shadow-md shadow-[#38A9F0]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Directions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            toggleSave(place.id);
            if (!saved) {
              trackPlaceSave(place.id);
              toast.success(`Saved "${place.name}" to your favorites!`);
            } else {
              toast(`Removed "${place.name}" from favorites`);
            }
          }}
          className={`w-full min-h-[44px] rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            saved
              ? 'bg-[#FFF0F0] border-[#FFD0D0] text-[#E5484D]'
              : 'border-[#DCE8F2] bg-white text-[#0F2A3D] hover:bg-[#F5FAFF]'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-[#E5484D]' : ''}`} />
          <span>{saved ? 'Saved in My Favorites' : 'Save to Favorites'}</span>
        </button>
      </div>

      {/* Subtext info */}
      <p className="text-[11px] text-[#5B7385] text-center leading-relaxed">
        GPS verified by UncoverCeylon travelers · No advance booking fees
      </p>

    </div>
  );
}
