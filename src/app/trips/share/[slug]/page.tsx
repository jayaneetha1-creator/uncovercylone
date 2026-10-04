/**
 * src/app/trips/share/[slug]/page.tsx
 * Read-only shareable itinerary view for friends, family, and travel groups.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trip } from '@/lib/trips/constants';
import { TripItemRow } from '@/components/TripItemRow';
import { TripMapSidePanel } from '@/components/TripMapSidePanel';
import Link from 'next/link';
import { Compass, Printer, ArrowRight, Share2, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function SharedTripPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const fetchSharedTrip = async () => {
      try {
        const res = await fetch(`/api/trips/share/${slug}`);
        if (!res.ok) {
          setError('This itinerary is private or has been removed.');
          return;
        }
        const data = await res.json();
        if (!cancelled && data.trip) {
          setTrip(data.trip);
        }
      } catch {
        if (!cancelled) setError('Failed to load shared itinerary.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSharedTrip();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-4 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-[#0284C7] rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading shared itinerary...</p>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-4 bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Itinerary Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'Trip not found.'}</p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369A1] transition-colors"
          >
            Create Your Own Trip
          </Link>
        </div>
      </main>
    );
  }

  const items = trip.items || [];

  return (
    <main className="min-h-screen pt-24 sm:pt-28 pb-20 bg-gradient-to-b from-[#F5FAFF] via-white to-[#F5FAFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-white rounded-3xl p-6 border border-[#DCE8F2] shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#DCEFFD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
                  Shared Itinerary
                </span>
                {trip.is_ai_planned && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Planned with AI
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F2A3D]">{trip.title}</h1>
              {trip.description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  {trip.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>

              <Link
                href="/trips"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369A1] transition-colors shadow-2xs"
              >
                Plan Your Own
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Stops List */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Itinerary Stops ({items.length})
            </h2>

            {items.map((item, idx) => (
              <TripItemRow
                key={item.id}
                item={item}
                index={idx}
                totalItems={items.length}
                readOnly={true}
                onToggleVisited={() => {}}
                onDelete={() => {}}
                onSaveNotes={() => {}}
              />
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-5 sticky top-28 h-[550px] sm:h-[650px]">
            <TripMapSidePanel items={items} />
          </div>
        </div>
      </div>
    </main>
  );
}
