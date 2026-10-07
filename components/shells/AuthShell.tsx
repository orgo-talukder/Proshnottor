'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient accent lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group z-10">
        <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center font-bold text-black text-xl transition-transform group-hover:scale-105">
          C
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#F5F5F5]">Chorcha</span>
      </Link>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl z-10">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1.5">{subtitle}</p>}
        </div>

        {children}
      </div>

      {/* Footer copyright */}
      <p className="text-xs text-[#6B6B6B] mt-8 z-10 text-center">
        Secured with Firebase Authentication · Pure Black Architecture
      </p>
    </div>
  );
}
