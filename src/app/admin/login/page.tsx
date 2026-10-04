'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isStaffLogin: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F2A3D] text-white shadow-lg mb-3">
          <ShieldCheck className="w-7 h-7 text-[#38A9F0]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F2A3D]">Staff Administration</h1>
        <p className="text-sm text-[#5B7385] mt-1">Authorized Owner, Developer & Uploader Portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] shadow-[0_8px_30px_rgba(15,42,61,0.06)]">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@uncoverceylon.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2A3D] text-[#0F2A3D] text-base transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#38A9F0] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2A3D] text-[#0F2A3D] text-base transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#0F2A3D] hover:bg-[#1E435E] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Management'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#DCE8F2] text-center text-xs text-[#5B7385]">
          Looking for traveler discovery?{' '}
          <Link href="/login" className="text-[#38A9F0] font-semibold hover:underline">
            Go to Public Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
