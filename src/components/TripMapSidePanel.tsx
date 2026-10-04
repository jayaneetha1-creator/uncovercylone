/**
 * src/components/TripMapSidePanel.tsx
 * Interactive route map for active trip with numbered waypoints, connecting polyline,
 * and live distance / travel time calculations.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TripItem } from '@/lib/trips/constants';
import { calculateDistanceKm } from '@/context/LocationContext';
import { Compass, Clock, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR 'window is not defined' errors
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
);

interface TripMapSidePanelProps {
  items: TripItem[];
  height?: string;
}

export function TripMapSidePanel({ items, height = '100%' }: TripMapSidePanelProps) {
  const [L, setL] = useState<any>(null);

  // Extract valid geo-located place items in trip order
  const geoStops = useMemo(() => {
    return items
      .filter((item) => item.place && item.place.latitude && item.place.longitude)
      .map((item, idx) => ({
        ...item,
        waypointNumber: idx + 1,
        lat: item.place!.latitude,
        lng: item.place!.longitude,
      }));
  }, [items]);

  // Compute total travel distance between consecutive stops
  const stats = useMemo(() => {
    if (geoStops.length < 2) {
      return { totalKm: 0, estHours: 0 };
    }
    let totalKm = 0;
    for (let i = 0; i < geoStops.length - 1; i++) {
      const dist = calculateDistanceKm(
        geoStops[i].lat,
        geoStops[i].lng,
        geoStops[i + 1].lat,
        geoStops[i + 1].lng
      );
      totalKm += dist;
    }
    // Estimated driving time (approx 42 km/h accounting for Sri Lanka terrain and stops)
    const estHours = Math.round((totalKm / 42) * 10) / 10;
    return {
      totalKm: Math.round(totalKm),
      estHours,
    };
  }, [geoStops]);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Compute center point of the route (default to Sri Lanka center if empty)
  const center: [number, number] = useMemo(() => {
    if (geoStops.length === 0) return [7.8731, 80.7718]; // Sri Lanka center
    const avgLat = geoStops.reduce((sum, s) => sum + s.lat, 0) / geoStops.length;
    const avgLng = geoStops.reduce((sum, s) => sum + s.lng, 0) / geoStops.length;
    return [avgLat, avgLng];
  }, [geoStops]);

  const polylineCoords = useMemo(() => {
    return geoStops.map((s) => [s.lat, s.lng] as [number, number]);
  }, [geoStops]);

  // Custom numbered HTML marker icon builder
  const createNumberedIcon = (num: number, isVisited: boolean) => {
    if (!L) return undefined;
    const bgClass = isVisited ? '#10B981' : '#0284C7';
    const html = `
      <div style="
        background-color: ${bgClass};
        color: white;
        border: 2.5px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border-radius: 9999px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        font-family: sans-serif;
      ">${num}</div>
    `;
    return L.divIcon({
      html,
      className: 'custom-trip-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 rounded-3xl overflow-hidden border border-[#DCE8F2]">
      {/* Route Stats Header Floating Pill */}
      <div className="absolute top-3 inset-x-3 z-1000 flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-md flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{stats.totalKm} km</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>~{stats.estHours}h travel</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>{geoStops.length} stops</span>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 w-full min-h-[360px]" style={{ height }}>
        {typeof window !== 'undefined' && (
          <MapContainer
            center={center}
            zoom={geoStops.length > 1 ? 8 : 7}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Connecting Polyline */}
            {polylineCoords.length > 1 && (
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: '#0284C7',
                  weight: 3.5,
                  dashArray: '8, 8',
                  opacity: 0.85,
                }}
              />
            )}

            {/* Numbered Waypoint Markers */}
            {geoStops.map((stop) => {
              const icon = createNumberedIcon(stop.waypointNumber, stop.is_visited);
              return (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lng]}
                  icon={icon}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px] text-center">
                      <div className="text-[11px] font-bold text-sky-600 uppercase">
                        Stop #{stop.waypointNumber}
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-0.5">
                        {stop.title}
                      </div>
                      {stop.notes && (
                        <div className="text-xs text-slate-500 italic mt-1 border-t pt-1">
                          &ldquo;{stop.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
