/**
 * src/components/AddToTripModal.tsx
 * Reusable modal for adding any destination to a trip with option to create new trips inline.
 */

'use client';

import React, { useState } from 'react';
import { TripPlace } from '@/lib/trips/constants';
import { useTrips } from '@/context/TripContext';
import { X, Plus, Calendar, Compass, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddToTripModalProps {
  place: TripPlace;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToTripModal({ place, isOpen, onClose }: AddToTripModalProps) {
  const { trips, activeTripId, addPlaceToTrip, createTrip } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(
    activeTripId || (trips.length > 0 ? trips[0].id : null)
  );
  const [notes, setNotes] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      let targetId = selectedTripId;

      if (isCreatingNew) {
        if (!newTripTitle.trim()) {
          toast.error('Please enter a trip name');
          setSubmitting(false);
          return;
        }
        const created = await createTrip(newTripTitle.trim());
        if (!created) {
          setSubmitting(false);
          return;
        }
        targetId = created.id;
      }

      if (!targetId) {
        toast.error('Please select or create a trip');
        setSubmitting(false);
        return;
      }

      await addPlaceToTrip(targetId, place, notes);
      onClose();
    } catch {
      toast.error('Could not add to trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-sky-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add to Trip</h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">
                {place.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isCreatingNew ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Choose Itinerary
              </label>

              {trips.length === 0 ? (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-center mb-3">
                  <p className="text-xs text-sky-800 font-medium mb-2">
                    You don&apos;t have any active itineraries yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Your First Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {trips.map((t) => {
                    const isSelected = selectedTripId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTripId(t.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#DCEFFD]/50 border-[#38A9F0] shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {t.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.items?.length || t.item_count || 0} stops planned
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create a new trip instead
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Trip Name
                </label>
                {trips.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Select existing trip
                  </button>
                )}
              </div>
              <input
                type="text"
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                placeholder="e.g. 7-Day Hill Country Odyssey"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                autoFocus
              />
            </div>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Personal Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wake up at 5:30 AM for sunrise view, pre-book ticket"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || (!isCreatingNew && trips.length === 0)}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Adding...' : 'Add to Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
