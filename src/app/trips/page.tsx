/**
 * src/app/trips/page.tsx
 * Dedicated Trip Planner Page (/trips).
 * Features:
 * - Multi-trip manager with custom dates and progress tracking
 * - Interactive split-screen route map with numbered stops and distance estimation
 * - Reorderable destinations, visited checkboxes, and custom to-do tasks
 * - Guest local-storage mode with automatic cloud sync on login
 * - Shareable read-only itinerary link generation
 * - Co-occurrence trip recommendations
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTrips } from '@/context/TripContext';
import { TripItemRow } from '@/components/TripItemRow';
import { TripMapSidePanel } from '@/components/TripMapSidePanel';
import { TripRecommendationsRow } from '@/components/TripRecommendationsRow';
import {
  Compass,
  Plus,
  Share2,
  Printer,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Map,
  List,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripsPage() {
  const {
    trips,
    activeTrip,
    activeTripId,
    setActiveTripId,
    createTrip,
    deleteTrip,
    updateTrip,
    addCustomTodo,
    toggleVisited,
    removeTripItem,
    updateTripItemNotes,
    reorderItems,
  } = useTrips();

  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newCustomTask, setNewCustomTask] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  const activeItems = activeTrip?.items || [];

  const progressPercent = useMemo(() => {
    if (activeItems.length === 0) return 0;
    const visited = activeItems.filter((i) => i.is_visited).length;
    return Math.round((visited / activeItems.length) * 100);
  }, [activeItems]);

  const placeIds = useMemo(() => {
    return activeItems
      .filter((i) => i.place_id !== null && i.place_id !== undefined)
      .map((i) => i.place_id as number);
  }, [activeItems]);

  const handleCreateNewTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripTitle.trim()) return;
    await createTrip(newTripTitle.trim());
    setNewTripTitle('');
    setIsCreatingTrip(false);
  };

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTask.trim() || !activeTrip) return;
    await addCustomTodo(activeTrip.id, newCustomTask.trim());
    setNewCustomTask('');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0 || !activeTrip) return;
    const newItems = [...activeItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    reorderItems(
      activeTrip.id,
      newItems.map((i) => i.id)
    );
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeItems.length - 1 || !activeTrip) return;
    const newItems = [...activeItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    reorderItems(
      activeTrip.id,
      newItems.map((i) => i.id)
    );
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !activeTrip?.share_slug) return '';
    return `${window.location.origin}/trips/share/${activeTrip.share_slug}`;
  }, [activeTrip]);

  const handleCopyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setHasCopiedShare(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setHasCopiedShare(false), 2500);
  };

  const handleToggleSharePublic = async () => {
    if (!activeTrip) return;
    const nextState = !activeTrip.is_public;
    await updateTrip(activeTrip.id, { is_public: nextState });
    toast.success(nextState ? 'Trip is now public and shareable!' : 'Trip is now private');
  };

  return (
    <main className="min-h-screen pt-24 sm:pt-28 pb-20 bg-gradient-to-b from-[#F5FAFF] via-white to-[#F5FAFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Trip Selector Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE8F2] shadow-2xs mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Trip Selector or Title */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-[#DCEFFD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
                  Itinerary Planner
                </span>
                {activeTrip?.is_ai_planned && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Planned with AI
                  </span>
                )}
              </div>

              {trips.length > 1 ? (
                <div className="flex items-center gap-3">
                  <select
                    value={activeTripId || (trips[0] ? trips[0].id : '')}
                    onChange={(e) => setActiveTripId(parseInt(e.target.value, 10))}
                    className="font-black text-xl sm:text-2xl text-[#0F2A3D] bg-transparent border-b-2 border-[#38A9F0] pb-1 focus:outline-hidden cursor-pointer"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <h1 className="font-black text-xl sm:text-2xl text-[#0F2A3D]">
                  {activeTrip ? activeTrip.title : 'My Sri Lanka Trip'}
                </h1>
              )}

              {activeTrip?.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {activeTrip.description}
                </p>
              )}
            </div>

            {/* Quick Actions (New Trip, Share, Print) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCreatingTrip(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                New Trip
              </button>

              {activeTrip && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DCEFFD] hover:bg-[#38A9F0] text-[#0284C7] hover:text-white font-bold text-xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="Print or save PDF"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${activeTrip.title}"?`)) {
                        deleteTrip(activeTrip.id);
                      }
                    }}
                    title="Delete Trip"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar & Status */}
          {activeTrip && activeItems.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>
                  Trip Progress: {activeItems.filter((i) => i.is_visited).length} of{' '}
                  {activeItems.length} stops visited
                </span>
                <span className="font-bold text-[#0284C7]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#38A9F0] to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile View Toggle (List vs Map) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            Itinerary List ({activeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'map'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            Route Map
          </button>
        </div>

        {/* Main Split Layout: Left Itinerary List & Right Map Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Itinerary Tasks & Stops */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Quick Add Custom Todo Form */}
            {activeTrip && (
              <form
                onSubmit={handleAddCustomTask}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-[#DCE8F2] shadow-2xs flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newCustomTask}
                  onChange={(e) => setNewCustomTask(e.target.value)}
                  placeholder="Add custom task (e.g. 'Book Ella train tickets', 'Rent scooter')..."
                  className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-xl border border-transparent focus:border-[#38A9F0] focus:outline-hidden bg-slate-50 focus:bg-white text-slate-800 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newCustomTask.trim()}
                  className="px-4 py-2 rounded-xl bg-[#DCEFFD] hover:bg-[#38A9F0] text-[#0284C7] hover:text-white font-bold text-xs transition-colors disabled:opacity-40"
                >
                  Add To-Do
                </button>
              </form>
            )}

            {/* List of Trip Items */}
            {activeItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#DCE8F2]">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl">
                  🧭
                </div>
                <h3 className="font-bold text-base text-[#0F2A3D] mb-1">
                  Your trip is currently empty
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Add destinations by tapping &ldquo;Add to Trip&rdquo; on any place page or check our suggestions below.
                </p>
                <a
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369A1] transition-colors"
                >
                  Explore Destinations
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeItems.map((item, index) => (
                  <TripItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    totalItems={activeItems.length}
                    onToggleVisited={(id) => activeTrip && toggleVisited(activeTrip.id, id)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onDelete={(id) => activeTrip && removeTripItem(activeTrip.id, id)}
                    onSaveNotes={(id, notes) =>
                      activeTrip && updateTripItemNotes(activeTrip.id, id, notes)
                    }
                  />
                ))}
              </div>
            )}

            {/* Co-Occurrence Recommendations */}
            {activeTrip && (
              <TripRecommendationsRow
                currentPlaceIds={placeIds}
                tripId={activeTrip.id}
              />
            )}
          </div>

          {/* Right Column: Sticky Route Map Panel */}
          <div
            className={`lg:col-span-5 sticky top-28 h-[550px] sm:h-[650px] ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <TripMapSidePanel items={activeItems} />
          </div>
        </div>
      </div>

      {/* Modal: New Trip Creation */}
      {isCreatingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <h3 className="text-lg font-bold text-[#0F2A3D] mb-1">Create New Trip</h3>
            <p className="text-xs text-slate-500 mb-4">
              Give your new Sri Lanka itinerary a memorable name.
            </p>
            <form onSubmit={handleCreateNewTrip} className="space-y-4">
              <input
                type="text"
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                placeholder="e.g. 10-Day Cultural Triangle & Coast"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#38A9F0]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTrip(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTripTitle.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-colors disabled:opacity-40"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Share Itinerary */}
      {isShareModalOpen && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <h3 className="text-lg font-bold text-[#0F2A3D] mb-1">Share Itinerary</h3>
            <p className="text-xs text-slate-500 mb-4">
              Share a read-only link of &ldquo;{activeTrip.title}&rdquo; with friends or travel companions.
            </p>

            <div className="space-y-4">
              {/* Public Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-sm font-bold text-slate-900">Public Link Access</div>
                  <div className="text-xs text-slate-500">
                    {activeTrip.is_public
                      ? 'Anyone with the link can view'
                      : 'Only you can view this trip'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSharePublic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    activeTrip.is_public ? 'bg-[#0284C7]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      activeTrip.is_public ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Link Box */}
              {activeTrip.is_public ? (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Shareable URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShare}
                      className="px-3.5 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#0369A1] transition-colors"
                    >
                      {hasCopiedShare ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {hasCopiedShare ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Enable public link access above to generate a shareable link.
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
