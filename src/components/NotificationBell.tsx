'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { NotificationRecord } from '@/lib/db/governance';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silently fail if not logged in or endpoint unmounted
    }
  }, []);

  // Initial fetch and 15-second polling per Section 4.5
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark single read error:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD] transition-colors cursor-pointer"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#DCE8F2] shadow-[0_12px_36px_rgba(15,42,61,0.12)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#DCE8F2]/60 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-[#38A9F0] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5B7385]">
                <Bell className="w-8 h-8 text-[#DCE8F2] mx-auto mb-2" />
                <span>No notifications yet. You&apos;re all caught up!</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    n.is_read
                      ? 'bg-white border-[#DCE8F2]/50 text-[#5B7385] opacity-75'
                      : 'bg-[#F5FAFF] border-[#38A9F0]/30 shadow-xs text-[#0F2A3D]'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {n.type.includes('delete') || n.type.includes('reject') ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : n.type.includes('approved') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Info className="w-4 h-4 text-[#38A9F0]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{n.title}</p>
                    <p className="text-[11px] line-clamp-2 mt-0.5 text-[#5B7385]">{n.body}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-[#5B7385]">
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[#38A9F0] font-bold hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>

                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#38A9F0] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
