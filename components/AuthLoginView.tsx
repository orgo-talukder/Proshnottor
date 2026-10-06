'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Current domain name
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'mcq-123.vercel.app';

  // Password matching validation
  const isPasswordMatch = tab === 'signup' && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = tab === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;
  const isLengthValid = password.length >= 6;

  const handleCopyDomain = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);

    if (tab === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না। অনুগ্রহ করে যাচাই করুন।');
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      onSuccessRedirect(nextUrl);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setErrorMsg('Firebase Authentication-এ Email/Password Sign-In Provider নিষ্ক্রিয় (Disabled) রয়েছে।');
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMsg('এই ডোমেনটি Firebase Console-এ অনুমোদিত (Authorized) নয়।');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইলটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে। লগইন ট্যাবে গিয়ে লগইন করুন।');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      } else {
        setErrorMsg(err.message || 'লগইনে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccessRedirect(nextUrl);
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMsg('আপনার বর্তমান ডোমেনটি Firebase Console-এ অনুমোদিত (Authorized) নয়।');
      } else if (err.code !== 'auth/popup-closed-by-user') {
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
                setIsOperationNotAllowed(false);
                setIsUnauthorizedDomain(false);
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
                setIsOperationNotAllowed(false);
                setIsUnauthorizedDomain(false);
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

          {/* Unauthorized Domain Special Help Box */}
          {isUnauthorizedDomain && (
            <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-200 text-xs space-y-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#FACC15]">Firebase ডোমেন অনুমোদন নির্দেশিকা (Fix):</span>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    আপনার এই ডোমেনটি Firebase Console-এ যুক্ত করতে হবে:
                  </p>
                </div>
              </div>

              {/* 1-Click Copy Domain Box */}
              <div className="p-2.5 rounded-lg border border-[#333] bg-[#121212] flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#FACC15] font-semibold truncate">
                  {currentHostname}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="px-2.5 py-1 rounded bg-[#262626] hover:bg-[#333] text-[11px] font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-[#A3A3A3] space-y-1 pt-1">
                <p>১. <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#FACC15] underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="h-2.5 w-2.5" /></a> ওপেন করুন।</p>
                <p>২. <strong>Authentication &gt; Settings &gt; Authorized domains</strong>-এ যান।</p>
                <p>৩. <strong>Add domain</strong> বাটনে ক্লিক করে উপরের ডোমেনটি পেস্ট করে Add করুন।</p>
              </div>
            </div>
          )}

          {/* Operation Not Allowed Special Help Box */}
          {isOperationNotAllowed && !isUnauthorizedDomain && (
            <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/30 text-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#FACC15]">Email/Password Provider চালু করার নিয়ম:</span>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    Firebase Console &gt; Authentication &gt; Sign-in method &gt; Email/Password অপশনটি <strong>Enable</strong> করুন।
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-900/40">
                <span className="text-[11px] text-[#A3A3A3] block mb-2">
                  অথবা এখনই দ্রুত প্রবেশের জন্য নিচের বাটনে ক্লিক করুন:
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-9 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Google দিয়ে সরাসরি প্রবেশ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errorMsg && !isOperationNotAllowed && !isUnauthorizedDomain && (
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

            {/* Password Field with Show/Hide Eye Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-[#A3A3A3]">
                  পাসওয়ার্ড (Password)
                </label>
                {tab === 'signup' && password.length > 0 && (
                  <span
                    className={`text-[10px] font-mono ${
                      isLengthValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isLengthValid ? '✓ কমপক্ষে ৬ অক্ষর' : 'কমপক্ষে ৬ অক্ষর প্রয়োজন'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none focus:border-[#FACC15]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#F5F5F5] p-1 transition-colors"
                  title={showPassword ? 'পাসওয়ার্ড গোপন করুন' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Only on Sign Up tab) */}
            {tab === 'signup' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-[#A3A3A3]">
                    পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[10px] flex items-center gap-1 font-medium ${
                        isPasswordMatch ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPasswordMatch ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>পাসওয়ার্ড মিলেছে</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>পাসওয়ার্ড মিলছে না</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={`w-full h-10 pl-9 pr-10 rounded-xl border bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none transition-colors ${
                      isPasswordMismatch
                        ? 'border-rose-600 focus:border-rose-500'
                        : isPasswordMatch
                        ? 'border-emerald-600 focus:border-emerald-500'
                        : 'border-[#262626] focus:border-[#FACC15]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#F5F5F5] p-1 transition-colors"
                    title={showConfirmPassword ? 'পাসওয়ার্ড গোপন করুন' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (tab === 'signup' && isPasswordMismatch)}
              className="w-full h-11 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'প্রসেসিং হচ্ছে...' : tab === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Security hint */}
        <div className="text-center text-[11px] text-[#555]">
          <span>নিরাপদ Firebase Authentication ও ক্লাউড ডাটাবেজ দ্বারা সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
}
