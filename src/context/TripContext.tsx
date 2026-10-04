/**
 * src/context/TripContext.tsx
 * Unified Trip State Provider for both Guests (localStorage) and Authenticated Users (Postgres/MySQL/SQLite).
 * Automatically migrates and syncs guest itineraries to the user account on sign-in.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Trip, TripItem, TripPlace } from '@/lib/trips/constants';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const GUEST_STORAGE_KEY = 'uc_guest_trips';
const ACTIVE_TRIP_KEY = 'uc_active_trip_id';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  activeTripId: number | null;
  setActiveTripId: (id: number | null) => void;
  isLoading: boolean;
  createTrip: (title: string, options?: { description?: string; start_date?: string; end_date?: string; is_ai_planned?: boolean }) => Promise<Trip | null>;
  updateTrip: (tripId: number, data: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (tripId: number) => Promise<boolean>;
  addPlaceToTrip: (tripId: number, place: TripPlace, notes?: string) => Promise<boolean>;
  addCustomTodo: (tripId: number, title: string, notes?: string, targetDate?: string) => Promise<boolean>;
  toggleVisited: (tripId: number, itemId: number) => Promise<boolean>;
  removeTripItem: (tripId: number, itemId: number) => Promise<boolean>;
  updateTripItemNotes: (tripId: number, itemId: number, notes: string) => Promise<boolean>;
  reorderItems: (tripId: number, itemIds: number[]) => Promise<boolean>;
  isInActiveTrip: (placeId: number) => boolean;
  refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeTripId, setActiveTripIdState] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ACTIVE_TRIP_KEY);
      if (stored) {
        const id = parseInt(stored, 10);
        return isNaN(id) ? null : id;
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const setActiveTripId = useCallback((id: number | null) => {
    setActiveTripIdState(id);
    try {
      if (id !== null) {
        localStorage.setItem(ACTIVE_TRIP_KEY, String(id));
      } else {
        localStorage.removeItem(ACTIVE_TRIP_KEY);
      }
    } catch {}
  }, []);

  // Fetch or sync trips on mount / when auth state changes
  const refreshTrips = useCallback(async () => {
    if (!user) {
      // Guest mode: load from localStorage
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setTrips(parsed);
            if (!activeTripId && parsed.length > 0) {
              setActiveTripId(parsed[0].id);
            }
          }
        }
      } catch {}
      return;
    }

    // Authenticated mode: check for guest trips to sync
    setIsLoading(true);
    try {
      const localGuestStored = localStorage.getItem(GUEST_STORAGE_KEY);
      let guestTripsToSync: Trip[] = [];
      if (localGuestStored) {
        try {
          const parsed = JSON.parse(localGuestStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            guestTripsToSync = parsed;
          }
        } catch {}
      }

      if (guestTripsToSync.length > 0) {
        // Sync to cloud
        const syncRes = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', guestTrips: guestTripsToSync }),
        });
        if (syncRes.ok) {
          localStorage.removeItem(GUEST_STORAGE_KEY);
          toast.success(`Synced ${guestTripsToSync.length} offline itinerary to your account! ✈️`);
        }
      }

      // Fetch user's trips from cloud
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        const userTrips: Trip[] = data.trips || [];
        setTrips(userTrips);

        // Fetch full active trip details if set
        if (activeTripId) {
          const matching = userTrips.find((t) => t.id === activeTripId);
          if (matching) {
            const detailRes = await fetch(`/api/trips/${activeTripId}`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              setTrips((prev) =>
                prev.map((t) => (t.id === activeTripId ? detailData.trip : t))
              );
            }
          } else if (userTrips.length > 0) {
            setActiveTripId(userTrips[0].id);
          }
        } else if (userTrips.length > 0) {
          setActiveTripId(userTrips[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to sync/fetch trips:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTripId, setActiveTripId]);

  // Initial load
  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  // Save guest trips to localStorage whenever modified in guest mode
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(trips));
      } catch {}
    }
  }, [trips, user]);

  // Active trip object derived from state
  const activeTrip = trips.find((t) => t.id === activeTripId) || (trips.length > 0 ? trips[0] : null);

  const isInActiveTrip = useCallback(
    (placeId: number) => {
      if (!activeTrip || !activeTrip.items) return false;
      return activeTrip.items.some((item) => item.place_id === placeId);
    },
    [activeTrip]
  );

  const createTrip = async (
    title: string,
    options?: { description?: string; start_date?: string; end_date?: string; is_ai_planned?: boolean }
  ): Promise<Trip | null> => {
    const trimmedTitle = title.trim() || 'My Sri Lanka Trip';

    if (!user) {
      // Guest local creation
      const newTrip: Trip = {
        id: -Date.now(), // Negative IDs indicate local guest draft
        title: trimmedTitle,
        description: options?.description || '',
        start_date: options?.start_date || '',
        end_date: options?.end_date || '',
        is_public: false,
        is_ai_planned: Boolean(options?.is_ai_planned),
        created_at: new Date().toISOString(),
        items: [],
        item_count: 0,
        visited_count: 0,
      };
      setTrips((prev) => [newTrip, ...prev]);
      setActiveTripId(newTrip.id);
      toast.success(`Created trip "${trimmedTitle}"!`);
      return newTrip;
    }

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: options?.description,
          start_date: options?.start_date,
          end_date: options?.end_date,
          is_ai_planned: options?.is_ai_planned,
        }),
      });

      if (!res.ok) throw new Error('Failed to create trip');
      const data = await res.json();
      const createdTrip: Trip = data.trip;
      setTrips((prev) => [createdTrip, ...prev]);
      setActiveTripId(createdTrip.id);
      toast.success(`Created trip "${trimmedTitle}"!`);
      return createdTrip;
    } catch (err) {
      console.error(err);
      toast.error('Could not create trip');
      return null;
    }
  };

  const updateTrip = async (tripId: number, data: Partial<Trip>): Promise<boolean> => {
    if (!user || tripId < 0) {
      // Guest local update
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, ...data, updated_at: new Date().toISOString() } : t))
      );
      toast.success('Trip updated');
      return true;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        setTrips((prev) => prev.map((t) => (t.id === tripId ? json.trip : t)));
        toast.success('Trip updated');
        return true;
      }
      return false;
    } catch {
      toast.error('Failed to update trip');
      return false;
    }
  };

  const deleteTrip = async (tripId: number): Promise<boolean> => {
    if (!user || tripId < 0) {
      // Guest local delete
      setTrips((prev) => {
        const next = prev.filter((t) => t.id !== tripId);
        if (activeTripId === tripId) {
          setActiveTripId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
      toast.success('Trip deleted');
      return true;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips((prev) => {
          const next = prev.filter((t) => t.id !== tripId);
          if (activeTripId === tripId) {
            setActiveTripId(next.length > 0 ? next[0].id : null);
          }
          return next;
        });
        toast.success('Trip deleted');
        return true;
      }
      return false;
    } catch {
      toast.error('Failed to delete trip');
      return false;
    }
  };

  const addPlaceToTrip = async (tripId: number, place: TripPlace, notes?: string): Promise<boolean> => {
    if (!user || tripId < 0) {
      // Guest local add
      const newItem: TripItem = {
        id: -Date.now(),
        trip_id: tripId,
        place_id: place.id,
        item_type: 'place',
        title: place.name,
        notes: notes || '',
        order_index: 999,
        is_visited: false,
        created_at: new Date().toISOString(),
        place,
      };

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentItems = t.items || [];
          if (currentItems.some((i) => i.place_id === place.id)) {
            toast('Already in trip', { icon: 'ℹ️' });
            return t;
          }
          const nextItems = [...currentItems, { ...newItem, order_index: currentItems.length }];
          return {
            ...t,
            items: nextItems,
            item_count: nextItems.length,
          };
        })
      );
      toast.success(`Added ${place.name} to trip! 📍`);
      return true;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: place.id,
          item_type: 'place',
          title: place.name,
          notes: notes || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to add stop');
      const data = await res.json();
      const addedItem: TripItem = data.item;

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentItems = t.items || [];
          const nextItems = [...currentItems, addedItem];
          return {
            ...t,
            items: nextItems,
            item_count: nextItems.length,
          };
        })
      );
      toast.success(`Added ${place.name} to trip! 📍`);
      return true;
    } catch {
      toast.error('Could not add to trip');
      return false;
    }
  };

  const addCustomTodo = async (
    tripId: number,
    title: string,
    notes?: string,
    targetDate?: string
  ): Promise<boolean> => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return false;

    if (!user || tripId < 0) {
      // Guest local
      const newItem: TripItem = {
        id: -Date.now(),
        trip_id: tripId,
        place_id: null,
        item_type: 'custom',
        title: trimmedTitle,
        notes: notes || '',
        order_index: 999,
        is_visited: false,
        target_date: targetDate || '',
        created_at: new Date().toISOString(),
        place: null,
      };

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentItems = t.items || [];
          const nextItems = [...currentItems, { ...newItem, order_index: currentItems.length }];
          return {
            ...t,
            items: nextItems,
            item_count: nextItems.length,
          };
        })
      );
      toast.success(`Added todo "${trimmedTitle}"! ✅`);
      return true;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'custom',
          title: trimmedTitle,
          notes: notes || '',
          target_date: targetDate || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to add custom todo');
      const data = await res.json();
      const addedItem: TripItem = data.item;

      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const currentItems = t.items || [];
          const nextItems = [...currentItems, addedItem];
          return {
            ...t,
            items: nextItems,
            item_count: nextItems.length,
          };
        })
      );
      toast.success(`Added todo "${trimmedTitle}"! ✅`);
      return true;
    } catch {
      toast.error('Could not add to-do');
      return false;
    }
  };

  const toggleVisited = async (tripId: number, itemId: number): Promise<boolean> => {
    let nextVisitedState = false;

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const nextItems = (t.items || []).map((item) => {
          if (item.id === itemId) {
            nextVisitedState = !item.is_visited;
            return { ...item, is_visited: nextVisitedState };
          }
          return item;
        });
        return {
          ...t,
          items: nextItems,
          visited_count: nextItems.filter((i) => i.is_visited).length,
        };
      })
    );

    if (!user || tripId < 0) return true;

    try {
      await fetch(`/api/trips/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visited: nextVisitedState }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const removeTripItem = async (tripId: number, itemId: number): Promise<boolean> => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const nextItems = (t.items || []).filter((i) => i.id !== itemId);
        return {
          ...t,
          items: nextItems,
          item_count: nextItems.length,
          visited_count: nextItems.filter((i) => i.is_visited).length,
        };
      })
    );
    toast('Removed from trip', { icon: '🗑️' });

    if (!user || tripId < 0) return true;

    try {
      await fetch(`/api/trips/${tripId}/items/${itemId}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  };

  const updateTripItemNotes = async (tripId: number, itemId: number, notes: string): Promise<boolean> => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const nextItems = (t.items || []).map((item) => (item.id === itemId ? { ...item, notes } : item));
        return { ...t, items: nextItems };
      })
    );

    if (!user || tripId < 0) return true;

    try {
      await fetch(`/api/trips/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const reorderItems = async (tripId: number, itemIds: number[]): Promise<boolean> => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const itemMap = new Map((t.items || []).map((i) => [i.id, i]));
        const sortedItems = itemIds
          .map((id, idx) => {
            const item = itemMap.get(id);
            return item ? { ...item, order_index: idx } : null;
          })
          .filter((item): item is TripItem => item !== null);

        return { ...t, items: sortedItems };
      })
    );

    if (!user || tripId < 0) return true;

    try {
      await fetch(`/api/trips/${tripId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds }),
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        activeTripId,
        setActiveTripId,
        isLoading,
        createTrip,
        updateTrip,
        deleteTrip,
        addPlaceToTrip,
        addCustomTodo,
        toggleVisited,
        removeTripItem,
        updateTripItemNotes,
        reorderItems,
        isInActiveTrip,
        refreshTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}
