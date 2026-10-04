/**
 * src/app/admin/components/NewsManagerTab.tsx
 * Admin management tab for AI Tourism News (Phase 10).
 * Features:
 * - On/Off switch, Auto-publish vs Review First toggle, Schedule viewer/editor
 * - "Run Crawler Now" manual execution with live feedback
 * - KPI summary stats (Total, Published, Review needed, Pinned)
 * - Article moderation table (Pin/Unpin, Hide/Publish, Edit, Delete with RBAC request queue)
 * - Manual article creation modal
 * - Crawler execution history (news_runs) log viewer
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  NewsItem,
  NewsRun,
  NewsSettings,
  NEWS_CATEGORIES,
} from '@/lib/news/constants';

interface NewsManagerTabProps {
  userRole?: string;
}

export default function NewsManagerTab({ userRole }: NewsManagerTabProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [runs, setRuns] = useState<NewsRun[]>([]);
  const [settings, setSettings] = useState<NewsSettings>({
    enabled: true,
    autoPublish: true,
    schedule: '06:00, 13:00, 20:00',
    lastRun: null,
  });
  const [counts, setCounts] = useState({
    total: 0,
    published: 0,
    review: 0,
    hidden: 0,
    pinned: 0,
  });

  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'history'>('articles');

  // Modal state for manual create / edit
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Events',
    source_name: '',
    source_url: '',
    image_url: '',
    status: 'published' as 'published' | 'review' | 'hidden',
    is_pinned: false,
  });

  const isOwner = userRole === 'owner';

  // Load news data and settings
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/news?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.settings) setSettings(data.settings);
        if (data.counts) setCounts(data.counts);
      }

      // Fetch runs history
      const runsRes = await fetch('/api/admin/news/runs?limit=15');
      const runsData = await runsRes.json();
      if (runsData.success) {
        setRuns(runsData.runs || []);
      }
    } catch (err) {
      console.error('Failed to load admin news data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update Settings
  const handleUpdateSetting = async (key: keyof NewsSettings, value: unknown) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          ...updated,
        }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update news settings:', err);
    }
  };

  // Run Crawler Now
  const handleRunCrawler = async () => {
    setCrawling(true);
    setCrawlMessage(null);
    try {
      const res = await fetch('/api/admin/news/crawl', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCrawlMessage(`Crawler Success: Found ${data.itemsFound} updates, added ${data.itemsAdded} new articles.`);
      } else {
        setCrawlMessage(`Notice: ${data.message || data.error || 'Failed'}`);
      }
      loadData();
    } catch (err) {
      setCrawlMessage(`Error executing crawl: ${String(err)}`);
    } finally {
      setCrawling(false);
    }
  };

  // Toggle Pin Status
  const handleTogglePin = async (item: NewsItem) => {
    try {
      const newPin = !Boolean(item.is_pinned);
      await fetch(`/api/admin/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: newPin }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Toggle Publish Status
  const handleStatusChange = async (item: NewsItem, newStatus: string) => {
    try {
      await fetch(`/api/admin/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete Article
  const handleDelete = async (item: NewsItem) => {
    const confirmPrompt = isOwner
      ? `Are you sure you want to permanently delete "${item.title}"?`
      : `Submit a deletion approval request to the owner for "${item.title}"?`;
    if (!confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`/api/admin/news/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.pendingApproval) {
        alert('Deletion request submitted to owner for review.');
      }
      loadData();
    } catch (err) {
      console.error('Failed to delete news:', err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      summary: item.summary,
      content: item.content || item.summary,
      category: item.category || 'Events',
      source_name: item.source_name,
      source_url: item.source_url || '',
      image_url: item.image_url || '',
      status: (item.status as 'published' | 'review' | 'hidden') || 'published',
      is_pinned: Boolean(item.is_pinned),
    });
  };

  // Save Edit / Create
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetch(`/api/admin/news/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setEditingItem(null);
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save article:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ━━━ TOP CONTROL BAR ━━━ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold mb-2 border border-sky-100">
            <span>📰</span>
            <span>Gemini Grounded Tourism News Crawler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AI Tourism News Hub Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Monitors real Sri Lanka travel advisories, national park schedules, railway services, and cultural events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunCrawler}
            disabled={crawling}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all active:scale-95 cursor-pointer ${
              crawling
                ? 'bg-sky-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'
            }`}
          >
            {crawling ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Crawling Web Updates...</span>
              </>
            ) : (
              <>
                <span>⚡ Run Crawler Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                title: '',
                summary: '',
                content: '',
                category: 'Events',
                source_name: 'UncoverCeylon Staff',
                source_url: '',
                image_url: '',
                status: 'published',
                is_pinned: false,
              });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
          >
            <span>+ Create Article</span>
          </button>
        </div>
      </div>

      {crawlMessage && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <span>{crawlMessage}</span>
          <button onClick={() => setCrawlMessage(null)} className="text-sky-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* ━━━ MASTER SETTINGS & KPI STATS ━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toggle 1: Master Enable */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">News Hub Active</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <button
            onClick={() => handleUpdateSetting('enabled', !settings.enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              settings.enabled ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Auto-Publish */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto-Publish Policy</div>
            <div className="text-xs text-slate-600 mt-1">
              {settings.autoPublish ? 'Instant Publish' : 'Review First'}
            </div>
          </div>
          <button
            onClick={() => handleUpdateSetting('autoPublish', !settings.autoPublish)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              settings.autoPublish ? 'bg-emerald-600' : 'bg-amber-400'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.autoPublish ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Schedule Display */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crawl Schedule</div>
          <div className="text-sm font-bold text-sky-800 mt-1 truncate">
            {settings.schedule}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Asia/Colombo (3x daily)</div>
        </div>

        {/* Counters */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Article Metrics</div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="font-bold text-emerald-700">{counts.published} Live</span>
              <span>•</span>
              <span className="font-bold text-amber-600">{counts.review} Review</span>
              <span>•</span>
              <span className="font-bold text-sky-600">{counts.pinned} Pinned</span>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.total}</div>
        </div>
      </div>

      {/* ━━━ SUB-TAB SWITCHER ━━━ */}
      <div className="flex items-center gap-3 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'articles'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          Articles ({counts.total})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          Crawler Execution Logs ({runs.length})
        </button>
      </div>

      {/* ━━━ TAB 1: ARTICLES MANAGEMENT ━━━ */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sky-100">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'published', 'review', 'hidden', 'pinned'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-36 sm:w-48"
              />
            </div>
          </div>

          {/* Articles Table */}
          {loading ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          ) : items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sky-100 text-slate-500">
              No news articles found matching the current filters.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-xs">
              <div className="divide-y divide-sky-50">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-sky-50/30 transition-colors"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-sky-200 flex items-center justify-center text-xl">📰</div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                          {Boolean(item.is_pinned) && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                              ★ Pinned
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.summary}
                        </p>
                        <div className="text-[11px] text-sky-700 font-medium mt-1">
                          Source: {item.source_name}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleTogglePin(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          item.is_pinned
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Toggle Pin"
                      >
                        {item.is_pinned ? 'Unpin' : 'Pin'}
                      </button>

                      {item.status === 'review' ? (
                        <button
                          onClick={() => handleStatusChange(item, 'published')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                        >
                          Approve
                        </button>
                      ) : item.status === 'published' ? (
                        <button
                          onClick={() => handleStatusChange(item, 'hidden')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Hide
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(item, 'published')}
                          className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-semibold transition-colors"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                      >
                        {isOwner ? 'Delete' : 'Request Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━ TAB 2: CRAWLER RUN HISTORY ━━━ */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-sky-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Automated Crawler Execution Log</h3>
            <span className="text-xs text-slate-500">3x Daily Asia/Colombo</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-sky-50/50 text-slate-700 font-semibold border-b border-sky-100">
                <tr>
                  <th className="p-3.5">Execution Time</th>
                  <th className="p-3.5">Trigger</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Found</th>
                  <th className="p-3.5">Added</th>
                  <th className="p-3.5">Details / Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No crawler runs recorded yet. Click &quot;Run Crawler Now&quot; to execute the first run.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.id} className="hover:bg-sky-50/20">
                      <td className="p-3.5 font-medium text-slate-900">
                        {new Date(run.executed_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 capitalize font-semibold">
                        {run.trigger_type}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            run.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{run.items_found}</td>
                      <td className="p-3.5 font-bold text-sky-700">{run.items_added}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-500">
                        {run.error_message || 'OK'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ━━━ EDIT / CREATE MODAL ━━━ */}
      {(editingItem || isCreateOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-sky-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-sky-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit News Article' : 'Create Tourism News Article'}
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsCreateOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    {NEWS_CATEGORIES.filter((c) => c.key !== 'All').map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="review">Review Needed</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Summary (Short) *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Article Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source URL</label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_pinned" className="font-bold text-slate-700 cursor-pointer">
                  Pin to top of news page
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreateOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
