/**
 * src/components/LatestNewsTeaser.tsx
 * Homepage "Latest Tourism News" teaser row.
 * Displays recent 3-4 news items in calm light-blue styling.
 * Honors Folder Manager zero-gap rule: returns null if disabled or empty.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsItem } from '@/lib/news/constants';
import { NewsArticleCard } from './NewsArticleCard';
import { NewsReaderModal } from './NewsReaderModal';

export function LatestNewsTeaser() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    async function loadLatestNews() {
      try {
        const res = await fetch('/api/news?limit=4');
        const data = await res.json();
        if (data.disabled) {
          setDisabled(true);
        } else if (Array.isArray(data.items)) {
          setNews(data.items);
        }
      } catch (err) {
        console.error('Error loading latest news teaser:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLatestNews();
  }, []);

  // Zero-gap rule: return null if disabled or loaded empty
  if (disabled || (!loading && news.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-sky-50/70 via-sky-50/30 to-white rounded-3xl p-6 sm:p-10 border border-sky-100/90 shadow-xs">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2 shadow-2xs">
                <span>✨</span>
                <span>Island Dispatches</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Latest Tourism Updates
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Fresh news on scenic railways, safari openings, festivals, and ocean conditions across Sri Lanka.
              </p>
            </div>

            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 hover:text-sky-900 text-xs sm:text-sm font-bold transition-all shadow-2xs shrink-0 self-start sm:self-auto group"
            >
              <span>Explore All News</span>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/60 animate-pulse border border-sky-50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => (
                <NewsArticleCard
                  key={item.id}
                  item={item}
                  onReadMore={(it) => setActiveStory(it)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewsReaderModal
        item={activeStory}
        onClose={() => setActiveStory(null)}
      />
    </section>
  );
}
