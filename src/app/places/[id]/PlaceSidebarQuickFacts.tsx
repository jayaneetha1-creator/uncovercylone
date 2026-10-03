'use client';

import { useState } from 'react';
import { Place } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useLocation } from '@/context/LocationContext';
import {
  MapPin, Tag, Ticket, Calendar, Clock, Navigation,
  ShieldCheck, Loader2, Sparkles, Check, Phone, MessageSquare, Zap
} from 'lucide-react';
import CurrencySelector from '@/components/CurrencySelector';

interface PlaceSidebarQuickFactsProps {
  place: Place;
}

export default function PlaceSidebarQuickFacts({ place }: PlaceSidebarQuickFactsProps) {
  const { convertFee, currencyInfo } = useCurrency();
  const { formatDistanceTo, userCoords, requestLocation, status: locationStatus } = useLocation();

  const distanceInfo = formatDistanceTo(place.lat, place.lng, place.distance_km);
  const convertedFee = convertFee(place.entry_fee);
  const isFree = !place.entry_fee || place.entry_fee.toLowerCase().includes('free');

  return (
    <div className="space-y-6">
      {/* ━━━ 1. TRIPADVISOR / ECOMMERCE STYLE PRICE HEADER (Image 3) ━━━ */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Admission & Entry
          </span>
          <div className="scale-90 origin-right">
            <CurrencySelector scrolled={true} />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-400">From</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            {convertedFee}
          </span>
          {!isFree && (
            <span className="text-xs text-slate-500 font-semibold">per adult</span>
          )}
        </div>

        {isFree ? (
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Free public access • No reservation fee required</span>
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Approx. rate in {currencyInfo.name} ({currencyInfo.code})
          </p>
        )}
      </div>

      {/* ━━━ 2. KEY ATTRIBUTES CHECKLIST ━━━ */}
      <div className="space-y-3.5 text-xs font-medium">
        {/* Dynamic Distance */}
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
            distanceInfo.isLive
              ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
              : 'bg-sky-50 text-sky-600 border-sky-100'
          }`}>
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{distanceInfo.isLive ? 'From Your Location' : 'From Colombo'}</span>
              {distanceInfo.isLive && (
                <span className="text-[9px] text-sky-600 font-bold bg-sky-50 border border-sky-200 px-1 py-0.2 rounded">
                  Live GPS
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center justify-between gap-2 mt-0.5">
              <span>{distanceInfo.text}</span>
              {!distanceInfo.isLive && (
                <button
                  type="button"
                  onClick={() => requestLocation()}
                  disabled={locationStatus === 'requesting'}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {locationStatus === 'requesting' ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <span>Use my GPS</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Location & Province */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region & District</div>
            <div className="text-sm font-bold text-slate-900 truncate">{place.location}, {place.province}</div>
          </div>
        </div>

        {/* Best Season */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Season</div>
            <div className="text-sm font-bold text-slate-900 truncate">{place.best_time || 'Year-round'}</div>
          </div>
        </div>
      </div>

      {/* ━━━ 3. TRIPADVISOR-STYLE TRUST & BOOKING HIGHLIGHTS (Image 3) ━━━ */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
        <div className="flex items-start gap-2.5 text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">100% Free & Open Access</span>
            <span className="text-[11px] text-emerald-700">No advance reservation fee required for this landmark</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-sky-900 bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/80">
          <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Works 100% Offline in PWA</span>
            <span className="text-[11px] text-sky-700">Guide stays accessible without cellular network on trails</span>
          </div>
        </div>
      </div>
    </div>
  );
}
