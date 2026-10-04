'use client';

/**
 * src/app/admin/components/AnalyticsTab.tsx
 * Admin Analytics Dashboard tab.
 * Visual charts for top places, weekly trends, search terms with 0 results, device split,
 * and one-click JSON visitor journey dataset export.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Heart,
  Navigation,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Search,
  RefreshCw,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { AnalyticsSummary } from '@/types';

export default function AnalyticsTab() {
  const [days, setDays] = useState<number>(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchAnalytics = async (selectedDays = days) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?days=${selectedDays}`);
      if (!res.ok) throw new Error('Failed to load analytics data');
      const data = await res.json();
      setSummary(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const handleDownloadJourneys = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/admin/analytics/journeys');
      if (!res.ok) throw new Error('Failed to export journeys');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uncoverceylon-journeys-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download journeys: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  const totalDevices =
    summary?.deviceBreakdown ?
      summary.deviceBreakdown.mobile + summary.deviceBreakdown.desktop + summary.deviceBreakdown.tablet
      : 1;

  const mobilePct = summary ? Math.round((summary.deviceBreakdown.mobile / (totalDevices || 1)) * 100) : 0;
  const desktopPct = summary ? Math.round((summary.deviceBreakdown.desktop / (totalDevices || 1)) * 100) : 0;
  const tabletPct = summary ? Math.round((summary.deviceBreakdown.tablet / (totalDevices || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#38A9F0]" />
            <h2 className="text-xl font-bold text-[#0F2A3D]">Analytics & Recommendations</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Privacy-conscious event tracking, real-time demand, and collaborative transition graph
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Days Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs font-semibold text-[#5B7385]">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  days === d ? 'bg-white text-[#0F2A3D] shadow-sm' : 'hover:text-[#0F2A3D]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchAnalytics(days)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#5B7385] transition"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Download Journey Paths JSON */}
          <button
            onClick={handleDownloadJourneys}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#38A9F0] hover:bg-[#2892d6] text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Export Journeys (.json)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EBF5FB] flex items-center justify-center text-[#38A9F0] flex-shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F2A3D]">
              {loading ? '...' : (summary?.totalViews ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-[#5B7385]">Place Views</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F2A3D]">
              {loading ? '...' : (summary?.totalClicks ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-[#5B7385]">Place Clicks</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F2A3D]">
              {loading ? '...' : (summary?.totalSaves ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-[#5B7385]">Wishlist Saves</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0F2A3D]">
              {loading ? '...' : (summary?.totalDirections ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-medium text-[#5B7385]">Directions Clicks</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Top Places & Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Places Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">Most Visited Places</h3>
            <span className="text-xs text-[#5B7385]">Last {days} days</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !summary?.topPlaces || summary.topPlaces.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#5B7385]">
              No place views recorded yet. Visit destinations to generate metrics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[#5B7385]">
                    <th className="pb-2.5 font-semibold">Rank & Place</th>
                    <th className="pb-2.5 font-semibold text-center">Category</th>
                    <th className="pb-2.5 font-semibold text-right">Views</th>
                    <th className="pb-2.5 font-semibold text-right">Clicks</th>
                    <th className="pb-2.5 font-semibold text-right">Saves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.topPlaces.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 flex items-center gap-3">
                        <span className="w-5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden bg-slate-100 flex-shrink-0">
                          <Image
                            src={p.image_url || '/placeholder.jpg'}
                            alt={p.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[#0F2A3D] line-clamp-1">{p.name}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#0F2A3D]">
                        {p.views.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-slate-600">
                        {p.clicks.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-pink-500 font-medium">
                        {p.saves.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Trending & Device Split */}
        <div className="space-y-6">
          {/* Trending This Week */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-bold text-[#0F2A3D]">Trending This Week</h3>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !summary?.trendingPlaces || summary.trendingPlaces.length === 0 ? (
              <p className="text-xs text-[#5B7385] py-4 text-center">
                Insufficient historical data for week-over-week trends.
              </p>
            ) : (
              <div className="space-y-2.5">
                {summary.trendingPlaces.map((tp) => (
                  <div
                    key={tp.id}
                    className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-semibold text-[#0F2A3D] line-clamp-1">
                      {tp.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{tp.recentViews} views</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        +{tp.growthPercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Split */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-[#0F2A3D] mb-3">Device Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-[#38A9F0]" /> Mobile
                  </span>
                  <span className="font-bold text-[#0F2A3D]">{mobilePct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38A9F0] rounded-full" style={{ width: `${mobilePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Monitor className="w-3.5 h-3.5 text-[#0F2A3D]" /> Desktop
                  </span>
                  <span className="font-bold text-[#0F2A3D]">{desktopPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F2A3D] rounded-full" style={{ width: `${desktopPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Tablet className="w-3.5 h-3.5 text-[#5B7385]" /> Tablet
                  </span>
                  <span className="font-bold text-[#0F2A3D]">{tabletPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5B7385] rounded-full" style={{ width: `${tabletPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Zero-Result Searches & Traffic Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zero-Result Searches */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-[#0F2A3D]">Search Terms with 0 Results</h3>
          </div>
          <p className="text-xs text-[#5B7385] mb-3">
            Shows what places visitors searched for that are not yet published on UncoverCeylon.
          </p>

          {!summary?.searchTermsNoResults || summary.searchTermsNoResults.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No unmatched search terms recorded. All queries found results!
            </div>
          ) : (
            <div className="space-y-2">
              {summary.searchTermsNoResults.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                >
                  <span className="font-semibold text-slate-700">“{st.query}”</span>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {st.count} searches
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic / Event Sources */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-[#0F2A3D] mb-1">Discovery Sources</h3>
          <p className="text-xs text-[#5B7385] mb-3">
            How users discover destinations across the application
          </p>

          {!summary?.eventSources || summary.eventSources.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No event sources registered yet.
            </div>
          ) : (
            <div className="space-y-2">
              {summary.eventSources.map((es, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                >
                  <span className="font-medium text-[#0F2A3D] capitalize">
                    {es.source.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-[#38A9F0]">{es.count} events</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ━━━ AGGREGATE TRIP ANALYTICS (Section 4.11) ━━━ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#DCEFFD] text-[#0284C7] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F2A3D]">
              Traveler Itineraries & Trip Planning Aggregate Stats
            </h3>
            <p className="text-xs text-[#5B7385]">
              Anonymized aggregate insights into destinations saved inside traveler custom trips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-2xl font-black text-[#0F2A3D]">
              {loading ? '...' : (summary?.tripStats?.totalTrips ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[#5B7385] mt-0.5">Total Trips Created</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-2xl font-black text-[#0284C7]">
              {loading ? '...' : (summary?.tripStats?.totalPlannedStops ?? 0).toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[#5B7385] mt-0.5">Total Stops Planned</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-2xl font-black text-emerald-600">
              {loading ? '...' : (summary?.tripStats?.avgPlacesPerTrip ?? 0)}
            </div>
            <div className="text-xs font-semibold text-[#5B7385] mt-0.5">Avg Stops per Itinerary</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Top 5 Destinations in Traveler Trips
          </h4>
          {!summary?.tripStats?.topPlaces || summary.tripStats.topPlaces.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No trip items registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {summary.tripStats.topPlaces.map((tp, idx) => (
                <div key={tp.id} className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-black text-[#0284C7]">#{idx + 1}</span>
                    <div className="text-xs font-bold text-slate-900 truncate">{tp.name}</div>
                  </div>
                  <span className="text-xs font-bold text-sky-800 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                    {tp.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
