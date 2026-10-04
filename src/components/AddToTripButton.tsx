/**
 * src/components/AddToTripButton.tsx
 * Interactive button to add a destination to an itinerary with "In your trip" status indicator.
 */

'use client';

import React, { useState } from 'react';
import { Place } from '@/types';
import { TripPlace } from '@/lib/trips/constants';
import { useTrips } from '@/context/TripContext';
import { AddToTripModal } from '@/components/AddToTripModal';
import { Compass, Check } from 'lucide-react';

interface AddToTripButtonProps {
  place: Place | TripPlace;
  variant?: 'pill' | 'card' | 'icon';
  className?: string;
}

export function AddToTripButton({ place, variant = 'pill', className = '' }: AddToTripButtonProps) {
  const { isInActiveTrip } = useTrips();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inTrip = isInActiveTrip(place.id);

  const isTripPlace = 'latitude' in place;
  const tripPlace: TripPlace = {
    id: place.id,
    name: place.name,
    name_si: (place as any).name_si,
    category: place.category,
    province: place.province,
    image_url: place.image_url,
    latitude: isTripPlace ? (place as TripPlace).latitude : (place as Place).lat || 0,
    longitude: isTripPlace ? (place as TripPlace).longitude : (place as Place).lng || 0,
    rating: place.rating,
    admission_fee: isTripPlace ? (place as TripPlace).admission_fee : (place as Place).entry_fee,
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={inTrip ? 'In your active trip' : 'Add to trip itinerary'}
          className={`p-2 rounded-xl transition-all ${
            inTrip
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-white/90 backdrop-blur-xs text-slate-700 hover:text-[#0284C7] hover:bg-white shadow-xs'
          } ${className}`}
        >
          {inTrip ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Compass className="w-4 h-4" />}
        </button>

        <AddToTripModal
          place={tripPlace}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
          inTrip
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-2xs'
            : 'bg-white border border-[#DCE8F2] hover:bg-[#DCEFFD]/50 hover:border-[#38A9F0]/60 text-[#0F2A3D] hover:text-[#0284C7] shadow-xs active:scale-95'
        } ${className}`}
      >
        {inTrip ? (
          <>
            <Check className="w-4 h-4 stroke-[2.5] text-emerald-600" />
            <span>In your trip</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4 text-[#0284C7]" />
            <span>Add to Trip</span>
          </>
        )}
      </button>

      <AddToTripModal
        place={tripPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
