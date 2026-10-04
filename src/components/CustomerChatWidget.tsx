'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare, X, Send, Loader2, Sparkles,
  CheckCircle2, User, ShieldCheck
} from 'lucide-react';

interface ChatMsg {
  id: number;
  sender_id: number;
  sender_role: 'user' | 'staff';
  sender_name?: string;
  sender_avatar?: string;
  message_text: string;
  created_at: string;
}

export default function CustomerChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/chat/customer');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Fetch customer chat error:', err);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchChat();
      const interval = setInterval(fetchChat, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const text = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        fetchChat();
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#38A9F0] hover:bg-[#38A9F0]/90 text-white font-bold px-4 py-3 rounded-full shadow-lg shadow-[#38A9F0]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Chat with Support Team"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs hidden sm:inline">Ask Support</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl border border-[#DCE8F2] shadow-2xl w-[calc(100vw-2rem)] sm:w-96 max-w-sm flex flex-col overflow-hidden max-h-[500px] h-[480px] animate-scale-in">
          {/* Header */}
          <div className="bg-[#38A9F0] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">UncoverCeylon Support</h3>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Local Team Available
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F5FAFF]">
            {!user ? (
              <div className="bg-white p-6 rounded-2xl border border-[#DCE8F2] text-center space-y-3 my-auto">
                <div className="w-10 h-10 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center mx-auto">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#0F2A3D]">Sign In to Chat</h4>
                <p className="text-[11px] text-[#5B7385] leading-relaxed">
                  Connect 1-on-1 with our local team for route planning, destination questions, and traveler assistance.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 rounded-xl bg-[#38A9F0] text-white font-bold text-xs shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-[#5B7385]">
                <MessageSquare className="w-8 h-8 text-[#DCE8F2] mx-auto" />
                <p className="text-xs font-bold text-[#0F2A3D]">Start a Conversation</p>
                <p className="text-[11px]">
                  Send a message to our Sri Lanka travel support team. We reply as soon as possible!
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender_role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {!isUser && (
                      <span className="text-[10px] font-bold text-[#38A9F0] mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        UncoverCeylon Team
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#38A9F0] text-white rounded-br-xs'
                          : 'bg-white text-[#0F2A3D] border border-[#DCE8F2] rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {m.message_text}
                    </div>
                    <span className="text-[9px] text-[#5B7385] mt-0.5 px-1 font-mono">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          {user && (
            <form onSubmit={handleSend} className="p-3 border-t border-[#DCE8F2] bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask about destinations, routes..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#F5FAFF] border border-[#DCE8F2] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
              <button
                type="submit"
                disabled={sending || !inputMsg.trim()}
                className="p-2 rounded-xl bg-[#38A9F0] hover:bg-[#38A9F0]/90 text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
