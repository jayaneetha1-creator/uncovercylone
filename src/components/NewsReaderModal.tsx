/**
 * src/components/NewsReaderModal.tsx
 * Modal reader dialog for complete article reading and related destination exploration.
 */

'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NewsItem, NEWS_CATEGORIES } from '@/lib/news/constants';

interface NewsReaderModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export function NewsReaderModal({ item, onClose }: NewsReaderModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const categoryMeta = NEWS_CATEGORIES.find((c) => c.key === item.category) || NEWS_CATEGORIES[0];
  const formattedDate = (() => {
    try {
      return new Date(item.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return item.published_at;
    }
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Close Bar */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto divide-y divide-sky-50">
          {/* Article Hero Banner */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-900">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover opacity-90"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white text-6xl">
                🇱🇰
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryMeta.badgeClass}`}>
                  {categoryMeta.label}
                </span>
                {Boolean(item.is_pinned) && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                    Pinned
                  </span>
                )}
              </div>
              <h1 id="news-modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="px-6 py-4 bg-sky-50/50 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">{formattedDate}</span>
              <span>•</span>
              <span className="text-sky-800 font-medium">Source: {item.source_name}</span>
            </div>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 hover:text-sky-900 hover:border-sky-300 font-semibold transition-all shadow-2xs"
              >
                <span>Original Publication</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Article Text Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Highlights Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-950">
              <h4 className="text-xs font-bold tracking-wide uppercase text-sky-700 mb-1">
                Traveler Summary
              </h4>
              <p className="text-sm sm:text-base leading-relaxed font-medium">
                {item.summary}
              </p>
            </div>

            {/* Detailed Content */}
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
              {item.content ? (
                item.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p>{item.summary}</p>
              )}
            </div>

            {/* Related Places to Visit */}
            {item.related_places && item.related_places.length > 0 && (
              <div className="pt-6 border-t border-sky-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>📍</span>
                  <span>Featured Destinations in this Story</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.related_places.map((place) => (
                    <Link
                      key={place.id}
                      href={`/places/${place.id}`}
                      onClick={onClose}
                      className="group flex items-center gap-3 p-3 rounded-2xl border border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 transition-all"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {place.image_url ? (
                          <Image
                            src={place.image_url}
                            alt={place.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-sky-200 flex items-center justify-center text-xs">🏝️</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-sky-700 truncate">
                          {place.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{place.location}</div>
                        <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                          <span>★</span>
                          <span>{place.rating || '4.8'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-sky-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Verified by UncoverCeylon AI Grounding
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Close Story
          </button>
        </div>
      </div>
    </div>
  );
}
