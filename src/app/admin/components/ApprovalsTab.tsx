'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, MapPin, User,
  AlertCircle, ExternalLink, RefreshCw, Loader2, Sparkles
} from 'lucide-react';
import { Place } from '@/types';

interface PendingPlace extends Place {
  submitter_name?: string;
  submitter_email?: string;
}

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  country: string;
  created_at: string;
}

export default function ApprovalsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'users'>('places');
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModalPlace, setRejectModalPlace] = useState<PendingPlace | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/approvals');
      if (res.ok) {
        const data = await res.json();
        setPlaces(data.pendingPlaces || []);
        setUsers(data.pendingUsers || []);
      }
    } catch (err) {
      console.error('Fetch approvals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (placeId: number, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(placeId);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/approvals/${placeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMsg({
        text: `Destination ${action === 'approve' ? 'approved and published to live directory!' : 'rejected.'}`,
        type: 'success',
      });
      setPlaces((prev) => prev.filter((p) => p.id !== placeId));
      setRejectModalPlace(null);
      setRejectReason('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing approval';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Approvals & Moderation Queue</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 5 & R30: Review traveler destination submissions and verify user accounts before publishing.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          disabled={loading}
          className="p-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#F5FAFF] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE8F2] pb-3">
        <button
          onClick={() => setActiveSubTab('places')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'places'
              ? 'bg-[#38A9F0] text-white shadow-sm'
              : 'bg-white text-[#5B7385] hover:text-[#0F2A3D] border border-[#DCE8F2]'
          }`}
        >
          <span>Pending Destinations ({places.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-[#38A9F0] text-white shadow-sm'
              : 'bg-white text-[#5B7385] hover:text-[#0F2A3D] border border-[#DCE8F2]'
          }`}
        >
          <span>Unverified Users ({users.length})</span>
        </button>
      </div>

      {/* Places Queue */}
      {activeSubTab === 'places' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-[#DCE8F2] text-center text-xs text-[#5B7385]">
              Loading pending submissions...
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#DCE8F2] text-center text-xs text-[#5B7385] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-[#0F2A3D]">Approvals queue is clear!</p>
              <p>All user destination submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col md:flex-row gap-6 items-start"
                >
                  {place.image_url ? (
                    <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-[#DCE8F2]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full md:w-48 h-36 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] flex items-center justify-center text-[#5B7385] flex-shrink-0">
                      <MapPin className="w-8 h-8 text-[#38A9F0]" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-[#0F2A3D]">{place.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#38A9F0]/10 text-[#38A9F0] border border-[#38A9F0]/20">
                        {place.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#5B7385]">
                        {place.province}
                      </span>
                    </div>

                    <p className="text-xs text-[#5B7385] line-clamp-2 leading-relaxed">
                      {place.short_description || place.description}
                    </p>

                    <div className="text-[11px] text-[#5B7385] flex flex-wrap gap-4 pt-1">
                      <span><strong>Location:</strong> {place.location}</span>
                      <span><strong>Coordinates:</strong> {place.lat}, {place.lng}</span>
                      <span><strong>Fee:</strong> {place.entry_fee}</span>
                    </div>

                    <div className="text-[11px] text-[#0F2A3D] bg-[#F5FAFF] p-2.5 rounded-xl border border-[#DCE8F2] flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#38A9F0]" />
                      <span>
                        Submitted by: <strong>{place.submitter_name || 'Traveler'}</strong> ({place.submitter_email || 'Verified user'})
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
                    <button
                      onClick={() => handleAction(place.id, 'approve')}
                      disabled={processingId === place.id}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {processingId === place.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectModalPlace(place);
                        setRejectReason('');
                      }}
                      disabled={processingId === place.id}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Sub Tab */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#5B7385]">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#5B7385]">No pending or unverified users.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5FAFF] border-b border-[#DCE8F2] text-[#5B7385] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE8F2]/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F5FAFF]">
                      <td className="py-3.5 px-4 font-bold text-[#0F2A3D]">{u.name}</td>
                      <td className="py-3.5 px-4 text-[#5B7385] font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5B7385]">{u.country}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5B7385] text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#DCE8F2] shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">
              Reject Submission: &quot;{rejectModalPlace.name}&quot;
            </h3>
            <p className="text-xs text-[#5B7385]">
              Please provide a brief reason. The submitter will receive a notification explaining why the destination was not approved.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inaccurate coordinates, insufficient photo resolution, or duplicate destination..."
              className="w-full p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE8F2]">
              <button
                onClick={() => setRejectModalPlace(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE8F2] text-xs font-bold text-[#5B7385]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModalPlace.id, 'reject', rejectReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
