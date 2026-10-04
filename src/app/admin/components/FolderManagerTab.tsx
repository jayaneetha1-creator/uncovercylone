'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, RotateCcw, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { SiteNode } from '@/types';

export default function FolderManagerTab() {
  const [nodes, setNodes] = useState<SiteNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/nodes');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
      }
    } catch (err) {
      console.error('Fetch nodes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleToggle = async (node: SiteNode) => {
    const newEnabled = node.enabled === 1 ? 0 : 1;
    try {
      setSavingId(node.id);
      const res = await fetch('/api/admin/nodes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: node.id, enabled: newEnabled }),
      });

      if (!res.ok) throw new Error('Failed to update node status');

      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, enabled: newEnabled } : n))
      );
      setMsg({
        text: `"${node.title_en}" is now ${newEnabled === 1 ? 'Enabled (Visible)' : 'Disabled (Zero-gap unmounted)'}`,
        type: 'success',
      });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Error updating node', type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset the site tree to default structure?')) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (!res.ok) throw new Error('Failed to reset tree');

      await fetchNodes();
      setMsg({ text: 'Site tree reset to defaults successfully!', type: 'success' });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Reset failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const pages = nodes.filter((n) => n.type === 'page');
  const getChildren = (pageKey: string) =>
    nodes.filter((n) => (n as unknown as { parent_key?: string }).parent_key === pageKey || n.parent_id === nodes.find(p => p.node_key === pageKey)?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Folder Manager (Site Tree)</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Control which sections and destination folders are displayed. Turning a section OFF leaves zero DOM gap on public pages.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#5B7385] hover:text-[#0F2A3D] bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
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

      {loading ? (
        <div className="py-16 text-center text-xs text-[#5B7385]">Loading site tree...</div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => {
            const children = getChildren(page.node_key);
            const isExpanded = expandedNodes[page.id] ?? true;

            return (
              <div
                key={page.id}
                className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden"
              >
                {/* Parent Page Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between bg-[#F5FAFF]/60 border-b border-[#DCE8F2]/60">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setExpandedNodes((prev) => ({ ...prev, [page.id]: !isExpanded }))
                      }
                      className="p-1 rounded-lg text-[#5B7385] hover:bg-[#EAF4FD] transition-transform cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0F2A3D]">{page.title_en}</span>
                        <span className="text-[10px] text-[#5B7385] font-normal">({page.title_si})</span>
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] border border-[#DCE8F2]">
                          PAGE
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5B7385] font-mono mt-0.5 block">
                        {page.node_key}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(page)}
                      disabled={savingId === page.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        page.enabled === 1 ? 'bg-[#38A9F0]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          page.enabled === 1 ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Sub-Folders / Sections */}
                {isExpanded && children.length > 0 && (
                  <div className="divide-y divide-[#DCE8F2]/40 bg-white">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="p-4 pl-12 sm:pl-16 flex items-center justify-between hover:bg-[#F5FAFF]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0F2A3D]">
                              {child.title_en}
                            </span>
                            <span className="text-[10px] text-[#5B7385]">({child.title_si})</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-[#5B7385]">
                              {child.type}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-[#5B7385] font-mono">
                            {child.node_key}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-[#5B7385] hidden sm:inline">
                            {child.enabled === 1 ? 'Active' : 'Hidden'}
                          </span>
                          <button
                            onClick={() => handleToggle(child)}
                            disabled={savingId === child.id}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                              child.enabled === 1 ? 'bg-[#38A9F0]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                child.enabled === 1 ? 'translate-x-4.5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
