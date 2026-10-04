'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, User, Send, CheckCircle2, Clock,
  RefreshCw, Loader2, Sparkles, Filter, ShieldCheck
} from 'lucide-react';

interface Thread {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  status: 'open' | 'resolved' | 'closed';
  last_message?: string;
  last_message_at?: string;
}

interface Message {
  id: number;
  thread_id: number;
  sender_id: number;
  sender_role: 'user' | 'staff';
  sender_name?: string;
  message_text: string;
  created_at: string;
}

export default function CustomerChatTab() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/chat/customer?staff=true');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        if (!selectedThread && (data.threads || []).length > 0) {
          setSelectedThread(data.threads[0]);
        }
      }
    } catch (err) {
      console.error('Fetch threads error:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const fetchMessages = async (threadId: number) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/chat/customer/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyText.trim() || sending) return;

    const text = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await fetch(`/api/chat/customer/${selectedThread.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        fetchMessages(selectedThread.id);
        fetchThreads();
      }
    } catch (err) {
      console.error('Send reply error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'open' | 'resolved') => {
    if (!selectedThread) return;
    try {
      const res = await fetch(`/api/chat/customer/${selectedThread.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSelectedThread({ ...selectedThread, status: newStatus });
        fetchThreads();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Customer Chat & Traveler Support</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 5 & R03: 1-on-1 direct customer support threads between registered travelers and local staff.
          </p>
        </div>

        <button
          onClick={fetchThreads}
          disabled={loadingThreads}
          className="p-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#F5FAFF] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loadingThreads ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Left: Threads List */}
        <div className="border-r border-[#DCE8F2] flex flex-col">
          {/* Thread Filter Bar */}
          <div className="p-3 border-b border-[#DCE8F2] bg-[#F5FAFF] flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F2A3D]">Active Conversations</span>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#38A9F0] text-white' : 'text-[#5B7385] hover:bg-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'open' ? 'bg-[#38A9F0] text-white' : 'text-[#5B7385] hover:bg-white'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'resolved' ? 'bg-[#38A9F0] text-white' : 'text-[#5B7385] hover:bg-white'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#DCE8F2]/60">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-[#5B7385]">Loading conversations...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5B7385]">No conversations found.</div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected ? 'bg-[#F5FAFF]' : 'hover:bg-[#F5FAFF]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {thread.user_name?.slice(0, 2).toUpperCase() || 'TR'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0F2A3D] truncate">
                          {thread.user_name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                            thread.status === 'open'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {thread.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5B7385] truncate">
                        {thread.last_message || 'No messages yet'}
                      </p>

                      <span className="text-[9px] text-[#5B7385]/70 block mt-1">
                        {thread.last_message_at
                          ? new Date(thread.last_message_at).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Thread Chat View */}
        <div className="col-span-2 flex flex-col h-full bg-[#F5FAFF]">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-[#DCE8F2] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F2A3D]">
                    {selectedThread.user_name}
                  </h3>
                  <span className="text-[11px] text-[#5B7385]">
                    {selectedThread.user_email}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedThread.status === 'open' ? (
                    <button
                      onClick={() => handleToggleStatus('resolved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus('open')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5B7385] bg-white hover:bg-slate-100 border border-[#DCE8F2] transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Re-open Thread</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-12 text-xs text-[#5B7385]">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#5B7385]">No messages in this thread yet.</div>
                ) : (
                  messages.map((m) => {
                    const isStaff = m.sender_role === 'staff';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-[#5B7385]">
                          {isStaff ? (
                            <span className="text-[#38A9F0] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Staff Member
                            </span>
                          ) : (
                            <span>{selectedThread.user_name}</span>
                          )}
                          <span>•</span>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isStaff
                              ? 'bg-[#38A9F0] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-[#0F2A3D] border border-[#DCE8F2] rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {m.message_text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-[#DCE8F2] flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official response to the traveler..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#38A9F0] hover:bg-[#38A9F0]/90 text-white font-bold text-xs shadow-md shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#5B7385]">
              <MessageSquare className="w-12 h-12 text-[#DCE8F2] mb-3" />
              <p className="text-xs font-bold text-[#0F2A3D]">Select a conversation to reply</p>
              <p className="text-[11px] mt-1">Choose a traveler from the list on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
