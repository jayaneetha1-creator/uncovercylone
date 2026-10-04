'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Image as ImageIcon, CheckCircle2,
  HardDrive, FileCheck, RefreshCw, Upload, AlertCircle, Loader2
} from 'lucide-react';

interface MediaStats {
  totalFiles: number;
  totalBytes: number;
  totalMb: string;
  webpCount: number;
  rawCount: number;
  needsOptimization: boolean;
}

interface OptimizeSummary {
  totalScanned: number;
  totalOptimized: number;
  originalBytes: number;
  optimizedBytes: number;
  bytesSaved: number;
  savingsPercent: number;
}

export default function MediaManagerTab() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [summary, setSummary] = useState<OptimizeSummary | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media/optimize');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch media stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/media/optimize', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Optimization failed');

      setSummary(data.summary);
      setMsg({
        text: `Optimization complete! Saved ${(data.summary.bytesSaved / 1024).toFixed(1)} KB across ${data.summary.totalOptimized} images (${data.summary.savingsPercent}% reduction).`,
        type: 'success',
      });
      fetchStats();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Optimization error';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Media Library & Sharp Optimizer</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 4.2 Compliance: Batch auto-rotate, EXIF strip, responsive sizing (480/960/1600px), and WebP conversion with zero layout shift.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#F5FAFF] transition-colors cursor-pointer"
            title="Refresh Media Stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleRunOptimizer}
            disabled={optimizing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#38A9F0]/90 shadow-md shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing All Images...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Optimize All Images</span>
              </>
            )}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE8F2] shadow-xs">
          <div className="flex items-center justify-between text-[#5B7385] text-xs font-bold uppercase mb-2">
            <span>Total Media Files</span>
            <ImageIcon className="w-4 h-4 text-[#38A9F0]" />
          </div>
          <div className="text-2xl font-black text-[#0F2A3D]">{stats?.totalFiles ?? 0}</div>
          <span className="text-[11px] text-[#5B7385]">Images stored on disk</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE8F2] shadow-xs">
          <div className="flex items-center justify-between text-[#5B7385] text-xs font-bold uppercase mb-2">
            <span>Disk Usage</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-[#0F2A3D]">{stats?.totalMb ?? '0.00'} MB</div>
          <span className="text-[11px] text-[#5B7385]">public/uploads directory</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE8F2] shadow-xs">
          <div className="flex items-center justify-between text-[#5B7385] text-xs font-bold uppercase mb-2">
            <span>Optimized WebP</span>
            <FileCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.webpCount ?? 0}</div>
          <span className="text-[11px] text-[#5B7385]">High quality, small payload</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE8F2] shadow-xs">
          <div className="flex items-center justify-between text-[#5B7385] text-xs font-bold uppercase mb-2">
            <span>Legacy Raw Images</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats?.rawCount ?? 0}</div>
          <span className="text-[11px] text-[#5B7385]">JPEG/PNG candidates</span>
        </div>
      </div>

      {/* Summary Box If Optimized */}
      {summary && (
        <div className="bg-[#F5FAFF] p-6 rounded-3xl border border-[#DCE8F2] space-y-4">
          <h3 className="text-sm font-bold text-[#0F2A3D]">Last Optimization Batch Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DCE8F2]">
              <div className="text-xs text-[#5B7385]">Original Payload</div>
              <div className="text-lg font-bold text-[#0F2A3D]">
                {(summary.originalBytes / 1024).toFixed(1)} KB
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DCE8F2]">
              <div className="text-xs text-[#5B7385]">Optimized WebP Payload</div>
              <div className="text-lg font-bold text-emerald-600">
                {(summary.optimizedBytes / 1024).toFixed(1)} KB
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DCE8F2]">
              <div className="text-xs text-[#5B7385]">Total Bandwidth Saved</div>
              <div className="text-lg font-bold text-[#38A9F0]">
                {summary.savingsPercent}% ({(summary.bytesSaved / 1024).toFixed(1)} KB)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
