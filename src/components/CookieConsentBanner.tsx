'use client';

/**
 * src/components/CookieConsentBanner.tsx
 * Lightweight, privacy-respecting cookie & analytics consent banner.
 * Allows users to accept anonymous analytics or clear their visitor journey history.
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Trash2 } from 'lucide-react';
import { getAnonymousSessionId } from '@/lib/analytics';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('uc_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flicker on initial load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('uc_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleClearHistory = async () => {
    try {
      setClearing(true);
      const sid = getAnonymousSessionId();
      await fetch('/api/user/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      });
      setCleared(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    } catch (err) {
      console.error('Error clearing history:', err);
    } finally {
      setClearing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md border border-[#DCE8F2] rounded-2xl p-4 shadow-xl shadow-[#0F2A3D]/10 text-xs text-[#0F2A3D] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-[#0F2A3D]">
            <ShieldCheck className="w-4 h-4 text-[#38A9F0]" />
            <span>Privacy &amp; Anonymous Analytics</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[#5B7385] leading-relaxed">
          UncoverCeylon uses privacy-friendly anonymous analytics to personalize your recommendations.
          We never store personal identifiers (PII), email addresses, or sell your data.
        </p>

        {cleared && (
          <p className="text-emerald-600 font-bold">
            ✓ Your visit history and journey paths have been cleared.
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={clearing || cleared}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>{clearing ? 'Clearing...' : 'Clear My History'}</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 bg-[#38A9F0] hover:bg-[#2892d6] text-white font-bold rounded-xl text-xs shadow-xs transition active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
