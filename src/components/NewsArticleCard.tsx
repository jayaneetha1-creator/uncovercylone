/**
 * src/components/NewsArticleCard.tsx
 * Card component for Sri Lanka Tourism News articles.
 * Follows calm light-blue styling, clean typography, source attribution, and related place links.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsItem, NEWS_CATEGORIES } from '@/lib/news/constants';

interface NewsArticleCardProps {
  item: NewsItem;
  onReadMore?: (item: NewsItem) => void;
  featured?: boolean;
}

export function NewsArticleCard({ item, onReadMore, featured = false }: NewsArticleCardProps) {
  const categoryMeta = NEWS_CATEGORIES.find((c) => c.key === item.category) || NEWS_CATEGORIES[0];

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(item.published_at);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return item.published_at;
    }
  }, [item.published_at]);

  if (featured) {
    return (
      <article className="relative bg-white rounded-3xl border border-sky-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 group">
        {/* Featured Image */}
        <div className="relative h-64 sm:h-80 lg:h-full lg:col-span-7 bg-slate-100 overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-5xl">
              🇱🇰
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${categoryMeta.badgeClass}`}>
              {categoryMeta.label}
            </span>
            {Boolean(item.is_pinned) && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
                Pinned Update
              </span>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-sky-50/40 to-white">
          <div>
            <div className="flex items-center gap-3 text-xs text-sky-800 font-medium mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formattedDate}
              </span>
              <span>•</span>
              <span className="truncate max-w-[200px] text-slate-500">
                {item.source_name}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug mb-3">
              {item.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed mb-4">
              {item.summary}
            </p>

            {/* Related Places Tag */}
            {item.related_places && item.related_places.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-slate-400 font-medium">Mentioned:</span>
                {item.related_places.map((place) => (
                  <Link
                    key={place.id}
                    href={`/places/${place.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100/70 hover:bg-sky-200 text-sky-900 text-xs font-semibold transition-colors"
                  >
                    <span>📍</span>
                    <span>{place.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-sky-100 flex items-center justify-between">
            <button
              onClick={() => onReadMore?.(item)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-all group/btn"
            >
              <span>Read Full Story</span>
              <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
              >
                <span>Official Source</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="bg-white rounded-2xl border border-sky-100/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Thumbnail */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-300 to-blue-500 flex items-center justify-center text-white text-3xl">
              🌴
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${categoryMeta.badgeClass}`}>
              {categoryMeta.label}
            </span>
            {Boolean(item.is_pinned) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-0.5">
                Pinned
              </span>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="truncate max-w-[160px] text-sky-700 font-semibold">{item.source_name}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug mb-2">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3">
            {item.summary}
          </p>

          {/* Related Place Chips */}
          {item.related_places && item.related_places.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {item.related_places.slice(0, 2).map((place) => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-medium transition-colors"
                >
                  <span>📍</span>
                  <span className="truncate max-w-[120px]">{place.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50/60 border-t border-sky-50 flex items-center justify-between">
        <button
          onClick={() => onReadMore?.(item)}
          className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 group/btn"
        >
          <span>Read update</span>
          <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
            title="External source"
          >
            <span>Source</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
