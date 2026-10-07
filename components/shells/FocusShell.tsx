'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, WifiOff, Clock, X, ShieldAlert } from 'lucide-react';

interface FocusShellProps {
  children: React.ReactNode;
  examTitle: string;
  timeLeftFormatted?: string;
  isUrgentTimer?: boolean;
  isOnline?: boolean;
  onExit?: () => void;
}

export default function FocusShell({
  children,
  examTitle,
  timeLeftFormatted,
  isUrgentTimer,
  isOnline = true,
  onExit,
}: FocusShellProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col font-sans select-none">
      {/* Top Focus Mode HUD */}
      <header className="sticky top-0 z-50 h-14 bg-[#0A0A0A] border-b border-[#262626] px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand + Exam Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded bg-[#FACC15] text-black font-bold flex items-center justify-center text-sm shrink-0">
            C
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#F5F5F5] truncate">
              {examTitle}
            </span>
            <span className="text-[10px] text-[#A3A3A3] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              Focus Examination Stage
            </span>
          </div>
        </div>

        {/* Center: Live Timer if provided */}
        {timeLeftFormatted && (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border tabular-nums transition-colors ${
              isUrgentTimer
                ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] animate-pulse font-bold'
                : 'bg-[#121212] border-[#3F3F3F] text-[#F5F5F5] font-semibold'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-sm tracking-wider">{timeLeftFormatted}</span>
          </div>
        )}

        {/* Right: Connectivity + Exit Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#A3A3A3]">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#EF4444]" />
                <span className="text-[#EF4444]">Offline Draft</span>
              </>
            )}
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#A3A3A3] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Focus Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
