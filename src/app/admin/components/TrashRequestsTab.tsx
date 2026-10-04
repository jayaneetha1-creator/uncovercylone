'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Clock, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { ChangeRequestRecord, TrashRecord } from '@/lib/db/governance';

interface DisplayTrashRecord extends TrashRecord {
  daysLeft?: number;
}

export default function TrashRequestsTab({ isOwner = true }: { isOwner?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'trash'>('requests');
  const [requests, setRequests] = useState<ChangeRequestRecord[]>([]);
  const [trashItems, setTrashItems] = useState<DisplayTrashRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/trash');
      if (res.ok) {
        const data = await res.json();
        const now = Date.now();
        const items: DisplayTrashRecord[] = (data.items || []).map((item: TrashRecord) => {
          const expires = new Date(item.expires_at).getTime();
          return {
            ...item,
            daysLeft: Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60 * 24))),
          };
        });
        setTrashItems(items);
      }
    } catch (err) {
      console.error('Fetch trash error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'requests') fetchRequests();
    else fetchTrash();
  }, [activeSubTab]);

  const handleReviewRequest = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status.toUpperCase()} this request?`)) return;

    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review request');

      setActionMsg({ text: `Request #${id} marked as ${status}.`, type: 'success' });
      await fetchRequests();
    } catch (err: unknown) {
      setActionMsg({ text: err instanceof Error ? err.message : 'Error reviewing request', type: 'error' });
    }
  };

  const handleRestoreTrash = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/trash/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore item');

      setActionMsg({ text: 'Item restored to active data successfully!', type: 'success' });
      await fetchTrash();
    } catch (err: unknown) {
      setActionMsg({ text: err instanceof Error ? err.message : 'Error restoring item', type: 'error' });
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently empty the trash? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/trash', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to empty trash');

      setActionMsg({ text: data.message || 'Trash emptied permanently.', type: 'success' });
      await fetchTrash();
    } catch (err: unknown) {
      setActionMsg({ text: err instanceof Error ? err.message : 'Error emptying trash', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Trash & Deletion Requests</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 4.4 Safety Rule: Only the owner can delete. Non-owners submit requests; approved deletes are preserved in Trash for 30 days.
          </p>
        </div>

        {/* Sub Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#F5FAFF] p-1.5 rounded-2xl border border-[#DCE8F2]">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-white text-[#0F2A3D] shadow-xs'
                : 'text-[#5B7385] hover:text-[#0F2A3D]'
            }`}
          >
            Change Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('trash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'trash'
                ? 'bg-white text-[#0F2A3D] shadow-xs'
                : 'text-[#5B7385] hover:text-[#0F2A3D]'
            }`}
          >
            30-Day Trash ({trashItems.length})
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            actionMsg.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* ━━━ 1. CHANGE REQUESTS VIEW ━━━ */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#5B7385]">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5B7385]">
              <Clock className="w-8 h-8 text-[#DCE8F2] mx-auto mb-2" />
              <span>No pending deletion or change requests.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8F2]/60">
              {requests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                        {req.action_type}
                      </span>
                      <span className="text-xs font-bold text-[#0F2A3D]">
                        {req.entity_type} #{req.entity_id}
                      </span>
                      <span className="text-[10px] text-[#5B7385]">
                        by {req.user_name || 'Staff'} ({req.user_role})
                      </span>
                    </div>
                    <p className="text-xs text-[#5B7385] leading-relaxed">
                      Reason: <span className="text-[#0F2A3D] font-medium">{req.reason}</span>
                    </p>
                    <span className="text-[10.5px] text-[#5B7385] mt-1 block">
                      Submitted on {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      isOwner ? (
                        <>
                          <button
                            onClick={() => handleReviewRequest(req.id, 'approved')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Trash</span>
                          </button>
                          <button
                            onClick={() => handleReviewRequest(req.id, 'rejected')}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          Pending Owner Review
                        </span>
                      )
                    ) : (
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ━━━ 2. 30-DAY TRASH VIEW ━━━ */}
      {activeSubTab === 'trash' && (
        <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-[#DCE8F2]/60 bg-[#F5FAFF]/50">
            <span className="text-xs font-bold text-[#0F2A3D]">Items in Trash ({trashItems.length})</span>
            {isOwner && trashItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Empty Trash Permanently
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#5B7385]">Loading trash items...</div>
          ) : trashItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5B7385]">
              <Trash2 className="w-8 h-8 text-[#DCE8F2] mx-auto mb-2" />
              <span>Trash is currently empty.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8F2]/60">
              {trashItems.map((item) => {
                const daysLeft = item.daysLeft ?? 30;

                return (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#0F2A3D]">
                          {item.entity_type.toUpperCase()} #{item.entity_id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {daysLeft} days until permanent delete
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5B7385] block">
                        Deleted by {item.deleted_by_name || 'Staff'} on {new Date(item.deleted_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestoreTrash(item.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAF4FD] hover:bg-[#DCE8F2] text-[#38A9F0] text-xs font-bold border border-[#DCE8F2] cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Active</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
