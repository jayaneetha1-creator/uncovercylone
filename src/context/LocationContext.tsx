'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface LocationContextType {
  userCoords: Coordinates | null;
  status: LocationStatus;
  requestLocation: () => Promise<Coordinates | null>;
  getDistanceTo: (destLat: number, destLng: number) => number | null;
  formatDistanceTo: (destLat: number, destLng: number, fallbackColomboKm?: number) => {
    text: string;
    isLive: boolean;
    km: number;
  };
}

const LocationContext = createContext<LocationContextType>({
  userCoords: null,
  status: 'idle',
  requestLocation: async () => null,
  getDistanceTo: () => null,
  formatDistanceTo: (_lat, _lng, fallback = 0) => ({
    text: fallback > 0 ? `${fallback} km from Colombo` : 'Scenic drive',
    isLive: false,
    km: fallback,
  }),
});

const STORAGE_KEY = 'uc_user_last_coords';

/**
 * Great-circle distance between two points on a sphere (Haversine Formula) in Kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d < 10 ? d * 10 : d) / (d < 10 ? 10 : 1);
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userCoords, setUserCoords] = useState<Coordinates | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.lat && parsed.lng) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [status, setStatus] = useState<LocationStatus>(() => {
    if (typeof window === 'undefined') return 'idle';
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.lat && parsed.lng) {
          return 'granted';
        }
      }
    } catch {}
    return 'idle';
  });

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      return null;
    }

    setStatus('requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCoords(coords);
          setStatus('granted');
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
          } catch {}
          resolve(coords);
        },
        (error) => {
          console.warn('Geolocation permission error:', error.message);
          setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, []);

  // Check if navigator.permissions allows querying geolocation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((res) => {
        if (res.state === 'granted') {
          requestLocation();
        } else if (res.state === 'denied') {
          setStatus('denied');
        }
      }).catch(() => {});
    }
  }, [requestLocation]);

  const getDistanceTo = useCallback(
    (destLat: number, destLng: number): number | null => {
      if (!userCoords) return null;
      return calculateDistanceKm(userCoords.lat, userCoords.lng, destLat, destLng);
    },
    [userCoords]
  );

  const formatDistanceTo = useCallback(
    (destLat: number, destLng: number, fallbackColomboKm = 0) => {
      if (userCoords) {
        const km = calculateDistanceKm(userCoords.lat, userCoords.lng, destLat, destLng);
        return {
          text: km < 1 ? 'Under 1 km away' : `${km} km from you`,
          isLive: true,
          km,
        };
      }

      return {
        text: fallbackColomboKm > 0 ? `${fallbackColomboKm} km from Colombo` : 'Scenic drive',
        isLive: false,
        km: fallbackColomboKm,
      };
    },
    [userCoords]
  );

  return (
    <LocationContext.Provider
      value={{
        userCoords,
        status,
        requestLocation,
        getDistanceTo,
        formatDistanceTo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
