'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthShell from '../../components/shells/AuthShell';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your account email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Unable to send password reset email. Please ensure the email address is registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email address to receive password recovery instructions."
    >
      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F5F5F5]">Recovery Email Dispatched</h3>
            <p className="text-xs text-[#A3A3A3]">
              We have sent password reset instructions to <span className="text-[#FACC15]">{email}</span>. Check your inbox or spam folder.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#FACC15] text-black font-semibold text-xs transition-colors mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="examinee@example.com"
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F5F5F5] placeholder-[#6B6B6B] outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Send Recovery Email</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#A3A3A3]">
            Remembered your password?{' '}
            <Link href="/login" className="text-[#FACC15] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
