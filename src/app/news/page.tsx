/**
 * src/app/news/page.tsx
 * Public Tourism News Hub for Sri Lanka.
 * Features:
 * - Calm, light-blue aesthetic
 * - Featured headline story with rich media
 * - Category filter chips with dynamic article counters
 * - Live search input
 * - Responsive 1/2/3-column card grid
 * - Instant modal reader with related destination navigation
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NewsItem, NEWS_CATEGORIES, NewsCategory } from '@/lib/news/constants';
import { NewsArticleCard } from '@/components/NewsArticleCard';
import { NewsReaderModal } from '@/components/NewsReaderModal';
import Link from 'next/link';

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.disabled) {
          setIsDisabled(true);
        } else if (Array.isArray(data.items)) {
          setItems(data.items);
          setCategoryCounts(data.categoryCounts || {});
        }
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  // Filter items by category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Featured story: first pinned item, or first item in list
  const featuredItem = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery.trim()) return null;
    return filteredItems.length > 0 ? filteredItems[0] : null;
  }, [filteredItems, selectedCategory, searchQuery]);

  // Remaining stories
  const gridItems = useMemo(() => {
    if (!featuredItem) return filteredItems;
    return filteredItems.slice(1);
  }, [filteredItems, featuredItem]);

  if (isDisabled) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-4 bg-slate-50 flex items-center justify-center">
        <div className="max-w-md text-center p-8 bg-white rounded-3xl border border-sky-100 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl">
            📰
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Tourism News Currently Inactive</h1>
          <p className="text-sm text-slate-500 mb-6">
            The tourism news updates section is taking a short maintenance break. Please check back shortly!
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 sm:pt-28 pb-20 bg-gradient-to-b from-sky-50/70 via-white to-sky-50/30">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-4 shadow-2xs">
            <span>🇱🇰</span>
            <span>Verified Island Dispatches</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Sri Lanka Tourism News
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Real-time, verified updates on scenic trains, national parks, seasonal weather, and cultural events across the island.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="mt-8 space-y-4 max-w-5xl mx-auto">
          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, festivals, trains, or wildlife..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-sky-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-all"
            />
            <div className="absolute left-3.5 top-3.5 text-sky-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
            {NEWS_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              const count = categoryCounts[cat.key] ?? 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
                    active
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-white hover:bg-sky-50 text-slate-700 border border-sky-100 hover:border-sky-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        active ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800 font-semibold'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-72 w-full bg-sky-100/60 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto bg-white rounded-3xl border border-sky-100 p-8 shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No tourism news found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              We couldn’t find any articles matching your search criteria. Try a different category or search term.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Article Card */}
            {featuredItem && (
              <NewsArticleCard
                item={featuredItem}
                onReadMore={(it) => setActiveStory(it)}
                featured
              />
            )}

            {/* Grid of Remaining Articles */}
            {gridItems.length > 0 && (
              <div>
                {featuredItem && (
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Recent Updates & Announcements</span>
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridItems.map((item) => (
                    <NewsArticleCard
                      key={item.id}
                      item={item}
                      onReadMore={(it) => setActiveStory(it)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <NewsReaderModal
        item={activeStory}
        onClose={() => setActiveStory(null)}
      />
    </main>
  );
}
