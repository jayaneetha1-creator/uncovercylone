'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send password reset email.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
        <p className="text-sm text-[#5B7385]">Recover your account access</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] shadow-[0_8px_30px_rgba(15,42,61,0.06)]">
        <h2 className="text-xl font-bold text-[#0F2A3D] mb-2">Forgot Password</h2>
        <p className="text-sm text-[#5B7385] mb-6">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#EAF4FD] border border-[#DCE8F2] flex items-start gap-3 text-[#0F2A3D] text-sm">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-[#38A9F0] mt-0.5" />
              <div>
                <p className="font-semibold text-base mb-1">Check your inbox</p>
                <p className="text-xs text-[#5B7385] leading-relaxed">
                  If an account exists for <span className="font-medium text-[#0F2A3D]">{email}</span>, we have sent a secure password reset link. The link is valid for 2 hours.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B7385] hover:text-[#0F2A3D] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
