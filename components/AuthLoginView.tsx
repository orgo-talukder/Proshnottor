'use client';

import React, { useState } from 'react';
import { useAuth, ADMIN_ALLOWLIST_EMAIL } from '../lib/auth-context';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface AuthLoginViewProps {
  nextUrl?: string;
  onSuccessRedirect: (dest: string) => void;
}

export default function AuthLoginView({
  nextUrl = '/dashboard',
  onSuccessRedirect,
}: AuthLoginViewProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      }
      onSuccessRedirect(nextUrl);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইলটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে। লগইন করুন।');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      } else {
        setErrorMsg('লগইনে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccessRedirect(nextUrl);
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('গুগল সাইন-ইনে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#FACC15] text-black font-black text-xl items-center justify-center shadow-lg shadow-[#FACC15]/10 mb-2">
            প্র
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
            প্রশ্নোত্তর (Proshnottor)
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            অনলাইন MCQ Exam ও লার্নিং প্ল্যাটফর্মে প্রবেশ করুন
          </p>
          {nextUrl && nextUrl !== '/dashboard' && (
            <p className="text-[11px] text-[#FACC15] font-mono">
              প্রবেশের পর সরাসরি <span className="underline">{nextUrl}</span> পেজে নিয়ে যাওয়া হবে
            </p>
          )}
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Tab Switcher (Login vs Sign Up) */}
          <div className="flex items-center p-1 rounded-xl bg-[#121212] border border-[#262626]">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                tab === 'login'
                  ? 'bg-[#262626] text-[#FACC15] shadow'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                tab === 'signup'
                  ? 'bg-[#262626] text-[#FACC15] shadow'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              নতুন অ্যাকাউন্ট (Sign Up)
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] hover:border-[#3F3F3F] text-xs font-bold text-[#F5F5F5] flex items-center justify-center gap-3 transition-colors active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            <span>Google দিয়ে সহজে সাইন-ইন করুন</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1C1C1C]" />
            <span className="text-[10px] uppercase font-mono text-[#555]">অথবা ইমেইল দিয়ে</span>
            <div className="h-px flex-1 bg-[#1C1C1C]" />
          </div>

          {/* Email Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {tab === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#A3A3A3]">
                  আপনার নাম (Full Name)
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="উদা: আরগো তালুকদার"
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[#A3A3A3]">
                ইমেইল ঠিকানা (Email Address)
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[#A3A3A3]">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'প্রসেসিং হচ্ছে...' : tab === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Security / Admin hint */}
        <div className="text-center text-[11px] text-[#555]">
          <span>নিরাপদ Firebase Authentication ও ক্লাউড ডাটাবেজ দ্বারা সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
}
