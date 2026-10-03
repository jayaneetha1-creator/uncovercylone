'use client';

import dynamic from 'next/dynamic';
import { Place } from '@/types';
import { MapPin, Navigation, ArrowUpRight, Loader2 } from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-3xl bg-slate-100 flex flex-col items-center justify-center text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
      <span className="text-xs font-semibold">Loading localized map...</span>
    </div>
  ),
});

interface PlaceMapProps {
  place: Place;
  compact?: boolean;
}

export default function PlaceMap({ place, compact = false }: PlaceMapProps) {
  if (compact) {
    return (
      <div className="w-full h-full min-h-[440px] sm:min-h-[500px] relative rounded-2xl overflow-hidden">
        <InteractiveMap
          places={[place]}
          center={[place.lat, place.lng]}
          zoom={13}
          height="100%"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Interactive Location Map
            </h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {place.location} · {place.province}
          </p>
        </div>

        <a
          href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-600/25 active:scale-95 text-xs flex-shrink-0"
        >
          <MapPin className="w-4 h-4" />
          <span>Get Driving Directions</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Embedded Map Container */}
      <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <InteractiveMap
          places={[place]}
          center={[place.lat, place.lng]}
          zoom={12}
          height="100%"
        />
      </div>

      {/* Coordinates strip */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-500">GPS Coordinates:</span>
          <span className="font-mono font-bold text-slate-900">
            {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E
          </span>
        </div>

        <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          Verified Pin
        </span>
      </div>
    </div>
  );
}
