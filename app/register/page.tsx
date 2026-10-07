'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShell from '../../components/shells/AuthShell';
import { useAuth } from '../../lib/auth-context';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      setError('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await signUpWithEmail(email, password, displayName);
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError('Google Sign In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Examinee Account"
      subtitle="Start taking mock exams and track your subject analytics."
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#3F3F3F] hover:border-[#6B6B6B] text-[#F5F5F5] font-semibold text-sm transition-colors mb-5 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign Up with Google</span>
      </button>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-[#262626] w-full" />
        <span className="bg-[#0A0A0A] px-3 text-[11px] uppercase font-semibold text-[#6B6B6B] absolute">
          Or Register with Email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Argo Talukder"
              className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F5F5F5] placeholder-[#6B6B6B] outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
            Email Address
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

        <div>
          <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#A3A3A3]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#FACC15] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
