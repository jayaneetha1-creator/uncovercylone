'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage('No verification token provided. Please check the link from your email.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setSuccess(false);
          setMessage(data.error || 'Verification failed. Link may be expired.');
        }
      } catch {
        setSuccess(false);
        setMessage('Network error verifying email. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F5FAFF] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#DCE8F2] shadow-[0_8px_30px_rgba(15,42,61,0.06)] text-center">
        {loading ? (
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-[#38A9F0] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F2A3D]">Verifying your email...</h2>
            <p className="text-sm text-[#5B7385] mt-2">Just a moment while we activate your account</p>
          </div>
        ) : success ? (
          <div className="py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F2A3D]">Email Verified!</h2>
            <p className="text-sm text-[#5B7385] mt-2 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-semibold rounded-xl shadow-md transition-all text-base"
            >
              Sign In to Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F2A3D]">Verification Issue</h2>
            <p className="text-sm text-[#5B7385] mt-2 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#0F2A3D] text-white font-semibold rounded-xl shadow-md transition-all text-base"
            >
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
