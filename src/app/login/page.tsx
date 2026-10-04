'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Mail, Lock, User, Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      router.push(data.redirectTo || '/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, country }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccessMsg(data.message || 'Account created! Please check your email to verify.');
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#38A9F0] text-white flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0F2A3D]">UncoverCeylon</span>
        </Link>
        <p className="text-sm text-[#5B7385]">Your authentic Sri Lanka travel guide & trip planner</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] shadow-[0_8px_30px_rgba(15,42,61,0.06)]">
        {/* Tab switch */}
        <div className="flex bg-[#EAF4FD] p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-[#0F2A3D] shadow-sm' : 'text-[#5B7385] hover:text-[#0F2A3D]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-[#0F2A3D] shadow-sm' : 'text-[#5B7385] hover:text-[#0F2A3D]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kasun Perera"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                Country of Residence
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Sri Lanka"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DCE8F2]" />
          </div>
          <span className="relative px-3 bg-white text-xs text-[#5B7385] uppercase tracking-wider font-semibold">
            Or continue with
          </span>
        </div>

        <a
          href="/api/auth/google"
          className="w-full py-3 px-4 bg-[#F5FAFF] hover:bg-[#EAF4FD] text-[#0F2A3D] font-semibold rounded-xl border border-[#DCE8F2] transition-all flex items-center justify-center gap-3 text-sm cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </a>

        <div className="mt-6 pt-6 border-t border-[#DCE8F2] text-center text-xs text-[#5B7385]">
          Are you a team member?{' '}
          <Link href="/admin/login" className="text-[#38A9F0] font-semibold hover:underline">
            Staff Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center text-[#5B7385]">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
