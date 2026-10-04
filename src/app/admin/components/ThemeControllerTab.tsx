'use client';

import React, { useState, useEffect } from 'react';
import { Palette, CheckCircle2, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { ThemeConfig, DEFAULT_THEME, SEASONAL_PRESETS, validateContrastAA } from '@/lib/theme';

export default function ThemeControllerTab() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/admin/theme')
      .then((res) => (res.ok ? res.json() : { theme: DEFAULT_THEME }))
      .then((data) => setTheme(data.theme || DEFAULT_THEME))
      .catch(() => setTheme(DEFAULT_THEME))
      .finally(() => setLoading(false));
  }, []);

  const contrast = validateContrastAA(theme.primaryColor, theme.backgroundColor);

  const handlePresetSelect = (presetKey: string) => {
    const presetData = SEASONAL_PRESETS[presetKey];
    if (presetData) {
      setTheme((prev) => ({ ...prev, ...presetData, preset: presetKey as ThemeConfig['preset'] }));
      setMsg({ text: `Switched to "${presetKey}" preset. Click Save to apply.`, type: 'success' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save theme');

      setMsg({ text: 'Theme tokens saved successfully!', type: 'success' });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Error saving theme', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#DCE8F2] text-center text-xs text-[#5B7385]">
        Loading theme configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-[#0F2A3D]">Theme Controller</h2>
        </div>
        <p className="text-xs text-[#5B7385] mt-1">
          Customize website branding colors, seasonal modes, and aesthetic tokens with automated WCAG AA accessibility contrast checks.
        </p>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Color Controls & Presets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seasonal Presets */}
          <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F2A3D] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#38A9F0]" />
              <span>Seasonal Presets</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'default', label: 'Default Island', color: '#38A9F0' },
                { id: 'vesak', label: 'Vesak Lantern', color: '#F5A623' },
                { id: 'avurudu', label: 'Sinhala Avurudu', color: '#27AE60' },
                { id: 'christmas', label: 'Festive Season', color: '#E74C3C' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    theme.preset === p.id
                      ? 'border-[#38A9F0] bg-[#EAF4FD]/50 shadow-xs'
                      : 'border-[#DCE8F2] bg-white hover:bg-[#F5FAFF]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full mb-2" style={{ backgroundColor: p.color }} />
                  <span className="text-xs font-bold text-[#0F2A3D] block">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tokens */}
          <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#0F2A3D]">Brand Colors</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-2">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#DCE8F2] p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-2">
                  Dark Headings Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#DCE8F2] p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-2">
                  Page Background Tint
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#DCE8F2] p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-2">
                  Border Line Tint
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.borderColor}
                    onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#DCE8F2] p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.borderColor}
                    onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Accessibility Check */}
        <div className="space-y-6">
          {/* Accessibility Check */}
          <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F2A3D] mb-3">Accessibility (WCAG AA)</h3>
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                contrast.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {contrast.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-bold">Contrast Ratio: {contrast.ratio}:1</p>
                <p className="text-[11px] leading-relaxed mt-0.5">{contrast.message}</p>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F2A3D] mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#38A9F0]" />
              <span>Live UI Preview</span>
            </h3>

            <div
              className="p-5 rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.backgroundColor,
                borderColor: theme.borderColor,
              }}
            >
              <h4 className="text-sm font-bold mb-1" style={{ color: theme.accentColor }}>
                Sigiriya Ancient Fortress
              </h4>
              <p className="text-xs text-[#5B7385] mb-4">
                Explore the magnificent 5th-century palace citadel rising dramatically above the emerald jungle.
              </p>
              <button
                type="button"
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Plan Your Visit
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold rounded-2xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Theme Tokens'}
          </button>
        </div>
      </form>
    </div>
  );
}
