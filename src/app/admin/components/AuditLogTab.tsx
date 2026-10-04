'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, Download } from 'lucide-react';
import { AuditLogRecord } from '@/lib/db/governance';

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = actionFilter !== 'all' ? `/api/admin/audit?action=${actionFilter}` : '/api/admin/audit';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.user_email.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Actor Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP'];
    const rows = logs.map((l) => [
      `"${l.created_at}"`,
      `"${l.user_email}"`,
      `"${l.user_role}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ip_address}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Administrative Audit Trail</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 4.4 Compliance: Immutable record of every administrative modification, deletion, and role action.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#0F2A3D] bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-bold text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
        >
          <option value="all">All Actions</option>
          <option value="login">Login</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="role_change">Role Change</option>
          <option value="theme_update">Theme Update</option>
          <option value="node_toggle">Node Toggle</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#5B7385]">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5B7385]">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5FAFF] border-b border-[#DCE8F2] text-[#5B7385] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE8F2]/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5FAFF]/50 transition-colors">
                    <td className="py-3 px-4 text-[#5B7385] whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F2A3D]">{log.user_email || 'System'}</div>
                      <span className="text-[10px] uppercase font-bold text-[#38A9F0]">{log.user_role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10.5px] font-bold bg-[#EAF4FD] text-[#0F2A3D] border border-[#DCE8F2]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5B7385]">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </td>
                    <td className="py-3 px-4 text-[#0F2A3D] max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-[#5B7385] font-mono text-[10.5px]">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
