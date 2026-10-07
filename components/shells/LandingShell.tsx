'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { ArrowRight, LogIn, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function LandingShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col font-sans">
      {/* Header: Strictly NO page links in header as mandated by guidelines */}
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-[#262626] h-16 px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center font-bold text-black text-lg transition-transform group-hover:scale-105">
            C
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F5F5F5]">Chorcha</span>
        </Link>

        {/* Minimal Header Actions only - NO page links */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#FACC15] hover:border-[#FACC15] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#FDE047] text-black font-semibold text-sm transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#FDE047] text-black font-semibold text-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#0A0A0A] py-8 px-4 md:px-8 text-center text-xs text-[#A3A3A3]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#FACC15] text-black font-bold flex items-center justify-center text-xs">C</div>
            <span className="font-semibold text-[#F5F5F5]">Chorcha Evaluation Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Chorcha. All rights reserved. Pure Black OLED Aesthetic.</p>
        </div>
      </footer>
    </div>
  );
}
