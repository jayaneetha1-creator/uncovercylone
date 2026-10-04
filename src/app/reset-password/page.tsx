'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please use the link provided in your reset email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] shadow-[0_8px_30px_rgba(15,42,61,0.06)]">
      <h2 className="text-xl font-bold text-[#0F2A3D] mb-2">Set New Password</h2>
      <p className="text-sm text-[#5B7385] mb-6">
        Please choose a strong password with at least 8 characters.
      </p>

      {(!token && !success) && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>Invalid or missing token. Please check the link from your email or request a new one.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 text-sm">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-base mb-1">Password reset successfully!</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Your password has been updated and all prior sessions have been invalidated. You can now sign in with your new password.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7385]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-[#0F2A3D] text-base transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#5B7385] hover:text-[#0F2A3D] transition-colors"
            >
              Need a new reset link?
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5FAFF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#38A9F0] text-white flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0F2A3D]">UncoverCeylon</span>
        </Link>
        <p className="text-sm text-[#5B7385]">Secure account recovery</p>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] text-center text-[#5B7385]">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
