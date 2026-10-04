'use client';

/**
 * src/components/AITripProposalCard.tsx
 * Interactive itinerary proposal card rendered inside AI chat messages.
 * Contains "Add to my trip" button linking to trip planner (Phase 11).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Plus, Check, Sparkles, LogIn, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ItineraryPlace {
  id?: number;
  name: string;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: ItineraryPlace[];
  travelTime?: string;
}

export interface ItineraryProposal {
  title: string;
  days: ItineraryDay[];
}

interface AITripProposalCardProps {
  proposal: ItineraryProposal;
  isLoggedIn?: boolean;
}

export default function AITripProposalCard({ proposal, isLoggedIn = false }: AITripProposalCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleAddToTrip = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }

    try {
      // Store in trips storage for Phase 11 Trip Planner
      const savedTripsRaw = localStorage.getItem('uc_user_trips');
      let userTrips = [];
      if (savedTripsRaw) {
        try {
          userTrips = JSON.parse(savedTripsRaw);
        } catch {
          userTrips = [];
        }
      }

      const newTrip = {
        id: `trip_ai_${Date.now()}`,
        name: proposal.title || 'Curated Ceylon Journey',
        daysCount: proposal.days?.length || 1,
        created_at: new Date().toISOString(),
        planned_with_ai: true,
        days: proposal.days || [],
        placesCount: (proposal.days || []).reduce((acc, d) => acc + (d.places?.length || 0), 0),
      };

      userTrips.unshift(newTrip);
      localStorage.setItem('uc_user_trips', JSON.stringify(userTrips));
      setIsSaved(true);
      toast.success(`"${newTrip.name}" saved to your trips! 🎒`);
    } catch {
      toast.error('Could not save trip right now.');
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-[#38A9F0]/40 bg-gradient-to-b from-[#F5FAFF] to-white p-4 sm:p-5 shadow-xs text-[#0F2A3D]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE8F2]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-[#DCEFFD]">
            <Sparkles className="w-3 h-3 text-[#F5A623]" />
            <span>AI Itinerary Proposal</span>
          </div>
          <h4 className="text-base font-extrabold text-[#0F2A3D]">
            {proposal.title || 'Island Journey Sequence'}
          </h4>
        </div>

        <button
          type="button"
          onClick={handleAddToTrip}
          disabled={isSaved}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isSaved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#38A9F0] hover:bg-[#1E93DC] text-white active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Trips</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add to my trip</span>
            </>
          )}
        </button>
      </div>

      {/* Days Breakdown */}
      <div className="mt-3.5 space-y-3.5">
        {(proposal.days || []).map((d) => (
          <div key={d.day} className="rounded-xl bg-white border border-[#EAF2F8] p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#0F2A3D]">
                <Calendar className="w-3.5 h-3.5 text-[#38A9F0]" />
                <span>Day {d.day}: {d.title}</span>
              </span>
              {d.travelTime && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#5B7385]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{d.travelTime}</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 pl-1">
              {(d.places || []).map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#38A9F0] mt-0.5 flex-shrink-0" />
                  <div>
                    {p.id ? (
                      <Link
                        href={`/places/${p.id}`}
                        className="font-bold text-[#0F2A3D] hover:text-[#38A9F0] transition inline-flex items-center gap-1"
                      >
                        <span>{p.name}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </Link>
                    ) : (
                      <span className="font-bold text-[#0F2A3D]">{p.name}</span>
                    )}
                    {p.notes && <span className="text-[#5B7385] ml-1.5">— {p.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sign In Required Prompt Modal */}
      {showSignInModal && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Sign in to save this trip to your account and sync with map routing.</span>
          </div>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
