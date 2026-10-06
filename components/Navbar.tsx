'use client';

import React from 'react';
import { ShieldCheck, UserCheck, BookOpen, Clock, BarChart3, Settings } from 'lucide-react';
import { getStoredUserRole, setStoredUserRole, getStoredFontScale, setStoredFontScale } from '../lib/store';

interface NavbarProps {
  currentTab: 'home' | 'mocks' | 'quizzes' | 'history' | 'admin';
  onSelectTab: (tab: 'home' | 'mocks' | 'quizzes' | 'history' | 'admin') => void;
  userRole: 'student' | 'admin';
  onRoleChange: (role: 'student' | 'admin') => void;
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  onFontScaleChange: (scale: 'sm' | 'md' | 'lg' | 'xl') => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  userRole,
  onRoleChange,
  fontScale,
  onFontScaleChange,
}: NavbarProps) {
  const toggleRole = () => {
    const nextRole = userRole === 'student' ? 'admin' : 'student';
    setStoredUserRole(nextRole);
    onRoleChange(nextRole);
    if (nextRole === 'admin') {
      onSelectTab('admin');
    } else if (currentTab === 'admin') {
      onSelectTab('home');
    }
  };

  const cycleFontScale = () => {
    const scales: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];
    const nextIdx = (scales.indexOf(fontScale) + 1) % scales.length;
    const nextScale = scales[nextIdx];
    setStoredFontScale(nextScale);
    onFontScaleChange(nextScale);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262626] bg-[#000000]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] rounded-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15] text-black font-black text-lg">
              প্র
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#F5F5F5]">
                প্রশ্নোত্তর
              </span>
              <span className="text-[10px] text-[#A3A3A3] leading-none">
                অনলাইন কুইজ ও মক এক্সাম
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap pb-1 ${
              currentTab === 'home'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15] font-semibold'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            সব পরীক্ষা
          </button>
          <button
            onClick={() => onSelectTab('mocks')}
            className={`transition-colors whitespace-nowrap pb-1 ${
              currentTab === 'mocks'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15] font-semibold'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            মক টেস্ট
          </button>
          <button
            onClick={() => onSelectTab('quizzes')}
            className={`transition-colors whitespace-nowrap pb-1 ${
              currentTab === 'quizzes'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15] font-semibold'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            অনুশীলন কুইজ
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors whitespace-nowrap pb-1 ${
              currentTab === 'history'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15] font-semibold'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            ফলাফল ও ইতিহাস
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`transition-colors whitespace-nowrap pb-1 flex items-center gap-1.5 ${
              currentTab === 'admin'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15] font-semibold'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            অ্যাডমিন প্যানেল
            {userRole === 'admin' && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" title="অ্যাডমিন সক্রিয়" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Font Size Switcher */}
          <button
            onClick={cycleFontScale}
            title="ফন্ট সাইজ পরিবর্তন করুন"
            className="flex h-8 items-center gap-1 rounded-md border border-[#262626] bg-[#0A0A0A] px-2.5 text-xs text-[#A3A3A3] hover:border-[#3F3F3F] hover:text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
          >
            <span className="font-semibold text-[#F5F5F5]">A</span>
            <span className="text-[10px] uppercase font-mono text-[#FACC15]">{fontScale}</span>
          </button>

          {/* Role Toggle Button */}
          <button
            onClick={toggleRole}
            className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] ${
              userRole === 'admin'
                ? 'border border-[#FACC15]/40 bg-[#FACC15]/10 text-[#FACC15]'
                : 'border border-[#262626] bg-[#0A0A0A] text-[#F5F5F5] hover:bg-[#121212]'
            }`}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-[#FACC15]" />
                <span>অ্যাডমিন মোড</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 text-[#A3A3A3]" />
                <span>শিক্ষার্থী মোড</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-[#262626] bg-[#000000] px-3 py-2 gap-3 text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            currentTab === 'home' ? 'bg-[#FACC15] text-black font-semibold' : 'text-[#A3A3A3]'
          }`}
        >
          সব পরীক্ষা
        </button>
        <button
          onClick={() => onSelectTab('mocks')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            currentTab === 'mocks' ? 'bg-[#FACC15] text-black font-semibold' : 'text-[#A3A3A3]'
          }`}
        >
          মক টেস্ট
        </button>
        <button
          onClick={() => onSelectTab('quizzes')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            currentTab === 'quizzes' ? 'bg-[#FACC15] text-black font-semibold' : 'text-[#A3A3A3]'
          }`}
        >
          অনুশীলন
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            currentTab === 'history' ? 'bg-[#FACC15] text-black font-semibold' : 'text-[#A3A3A3]'
          }`}
        >
          ফলাফল
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            currentTab === 'admin' ? 'bg-[#FACC15] text-black font-semibold' : 'text-[#A3A3A3]'
          }`}
        >
          অ্যাডমিন
        </button>
      </div>
    </header>
  );
}
